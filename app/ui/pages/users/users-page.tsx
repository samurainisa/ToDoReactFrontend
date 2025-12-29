import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { confirmDialog } from "primereact/confirmdialog";
import { DataTable, type DataTablePageEvent, type DataTableSortEvent } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router";
import { z } from "zod";
import {
  normalizeApiError,
  normalizeLimit,
  normalizePage,
  normalizeSearch,
  normalizeSortField,
  normalizeSortOrder,
  tryParseDate,
  type SortOrder,
} from "~/api/pagination";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  type User,
} from "~/api/users/users-api";
import { useToast } from "~/ui/base/toast-provider";

const userFormSchema = z.object({
  email: z.string().min(1, "Введите email").email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов").optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

export function UsersPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = normalizePage(searchParams.get("page"), 1);
  const limit = normalizeLimit(searchParams.get("limit"), 10);
  const sortBy = normalizeSortField(searchParams.get("sortBy"), "createdAt");
  const sortOrder = normalizeSortOrder(searchParams.get("sortOrder"), "desc");
  const search = normalizeSearch(searchParams.get("search"));

  const sortOrderValue = sortOrder === "asc" ? 1 : -1;
  const first = (page - 1) * limit;

  const [searchText, setSearchText] = useState(search);

  useEffect(() => {
    setSearchText(search);
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchText === search) return;
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (searchText.trim()) next.set("search", searchText.trim());
        else next.delete("search");
        next.set("page", "1");
        return next;
      });
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchText, search, setSearchParams]);

  const updateParams = (updates: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(updates)) {
        if (!value) next.delete(key);
        else next.set(key, value);
      }
      return next;
    });
  };

  const usersQuery = useQuery({
    queryKey: ["users", page, limit, sortBy, sortOrder, search],
    queryFn: () => getUsers({ page, limit, sortBy, sortOrder, search }),
    placeholderData: keepPreviousData,
  });

  const users = usersQuery.data?.items ?? [];
  const total = usersQuery.data?.total ?? 0;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.show({ severity: "success", summary: "Успешно", detail: "Пользователь создан", life: 2500 });
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.show({ severity: "error", summary: "Ошибка", detail: normalizeApiError(error), life: 3500 });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: { email: string; password?: string } }) =>
      updateUser(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.show({ severity: "success", summary: "Успешно", detail: "Пользователь обновлён", life: 2500 });
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.show({ severity: "error", summary: "Ошибка", detail: normalizeApiError(error), life: 3500 });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.show({ severity: "success", summary: "Удалено", detail: "Пользователь удалён", life: 2000 });
    },
    onError: (error) => {
      toast.show({ severity: "error", summary: "Ошибка", detail: normalizeApiError(error), life: 3500 });
    },
  });

  const openCreateDialog = () => {
    setEditingUser(null);
    reset({ email: "", password: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    reset({ email: user.email, password: "" });
    setDialogOpen(true);
  };

  const confirmDelete = (user: User) => {
    confirmDialog({
      header: "Удалить пользователя?",
      message: `Удалить ${user.email}?`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Удалить",
      rejectLabel: "Отмена",
      acceptClassName: "p-button-danger",
      accept: () => deleteMutation.mutate(user.id),
    });
  };

  const handlePage = (event: DataTablePageEvent) => {
    updateParams({
      page: String((event.page ?? 0) + 1),
      limit: String(event.rows),
    });
  };

  const handleSort = (event: DataTableSortEvent) => {
    const field = typeof event.sortField === "string" ? event.sortField : "";
    const order: SortOrder = event.sortOrder === 1 ? "asc" : "desc";
    updateParams({
      sortBy: field || null,
      sortOrder: order,
      page: "1",
    });
  };

  const createdAtBody = (user: User) => {
    const d = tryParseDate(user.createdAt);
    return d ? <span>{d.toLocaleString()}</span> : <span>-</span>;
  };

  const actionsBody = (user: User) => (
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <Button
        type="button"
        icon="pi pi-pencil"
        rounded
        text
        onClick={() => openEditDialog(user)}
        aria-label="Редактировать"
      />
      <Button
        type="button"
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        onClick={() => confirmDelete(user)}
        aria-label="Удалить"
      />
    </div>
  );

  const dialogHeader = editingUser ? "Редактирование пользователя" : "Новый пользователь";

  const onSubmit = async (data: UserFormData) => {
    if (editingUser) {
      const dto = {
        email: data.email,
        ...(data.password?.trim() ? { password: data.password.trim() } : {}),
      };
      await updateMutation.mutateAsync({ id: editingUser.id, dto });
      return;
    }
    if (!data.password?.trim()) {
      setError("password", { type: "manual", message: "Введите пароль" });
      return;
    }

    await createMutation.mutateAsync({ email: data.email, password: data.password.trim() });
  };

  return (
    <div style={{ width: "100%", maxWidth: 1200, display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Пользователи</h1>
        <Button label="Создать" icon="pi pi-plus" onClick={openCreateDialog} />
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span className="p-input-icon-left" style={{ flex: 1, minWidth: 260 }}>
          <i className="pi pi-search" />
          <InputText
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Поиск по email"
            style={{ width: "100%" }}
          />
        </span>
      </div>

      <DataTable
        value={users}
        dataKey="id"
        lazy
        paginator
        rows={limit}
        first={first}
        totalRecords={total}
        onPage={handlePage}
        onSort={handleSort}
        sortField={sortBy}
        sortOrder={sortOrderValue}
        loading={usersQuery.isFetching}
        emptyMessage="Нет пользователей"
        responsiveLayout="scroll"
      >
        <Column field="id" header="ID" style={{ width: 80 }} sortable />
        <Column field="email" header="Email" sortable />
        <Column header="Создан" body={createdAtBody} sortable field="createdAt" style={{ width: 220 }} />
        <Column header="Действия" body={actionsBody} style={{ width: 160 }} />
      </DataTable>

      <Dialog
        header={dialogHeader}
        visible={dialogOpen}
        onHide={() => setDialogOpen(false)}
        style={{ width: "100%", maxWidth: 520 }}
        modal
      >
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="email">Email</label>
            <InputText id="email" {...register("email")} className={errors.email ? "p-invalid" : ""} />
            {errors.email && <small style={{ color: "red" }}>{errors.email.message}</small>}
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="password">{editingUser ? "Новый пароль (необязательно)" : "Пароль"}</label>
            <InputText
              id="password"
              type="password"
              {...register("password")}
              className={errors.password ? "p-invalid" : ""}
            />
            {errors.password && <small style={{ color: "red" }}>{errors.password.message}</small>}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <Button
              type="button"
              label="Отмена"
              outlined
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            />
            <Button
              type="submit"
              label={editingUser ? "Сохранить" : "Создать"}
              loading={createMutation.isPending || updateMutation.isPending}
              disabled={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
}
