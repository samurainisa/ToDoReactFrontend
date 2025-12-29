import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { confirmDialog } from "primereact/confirmdialog";
import { DataTable, type DataTablePageEvent, type DataTableSortEvent } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
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
  createProject,
  deleteProject,
  getProjects,
  updateProject,
  type Project,
} from "~/api/projects/projects-api";
import { useToast } from "~/ui/base/toast-provider";

const projectFormSchema = z.object({
  name: z.string().min(1, "Введите название проекта"),
  description: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

export function ProjectsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
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

  const projectsQuery = useQuery({
    queryKey: ["projects", page, limit, sortBy, sortOrder, search],
    queryFn: () => getProjects({ page, limit, sortBy, sortOrder, search }),
    placeholderData: keepPreviousData,
  });

  const projects = projectsQuery.data?.items ?? [];
  const total = projectsQuery.data?.total ?? 0;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.show({ severity: "success", summary: "Успешно", detail: "Проект создан", life: 2500 });
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.show({ severity: "error", summary: "Ошибка", detail: normalizeApiError(error), life: 3500 });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: { name: string; description?: string } }) =>
      updateProject(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.show({ severity: "success", summary: "Успешно", detail: "Проект обновлён", life: 2500 });
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.show({ severity: "error", summary: "Ошибка", detail: normalizeApiError(error), life: 3500 });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.show({ severity: "success", summary: "Удалено", detail: "Проект удалён", life: 2000 });
    },
    onError: (error) => {
      toast.show({ severity: "error", summary: "Ошибка", detail: normalizeApiError(error), life: 3500 });
    },
  });

  const openCreateDialog = () => {
    setEditingProject(null);
    reset({ name: "", description: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    reset({ name: project.name, description: project.description ?? "" });
    setDialogOpen(true);
  };

  const confirmDelete = (project: Project) => {
    confirmDialog({
      header: "Удалить проект?",
      message: `Удалить «${project.name}»?`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Удалить",
      rejectLabel: "Отмена",
      acceptClassName: "p-button-danger",
      accept: () => deleteMutation.mutate(project.id),
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

  const createdAtBody = (project: Project) => {
    const d = tryParseDate(project.createdAt);
    return d ? <span>{d.toLocaleString()}</span> : <span>-</span>;
  };

  const actionsBody = (project: Project) => (
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <Button
        type="button"
        icon="pi pi-list"
        rounded
        text
        onClick={() => navigate(`/projects/${project.id}/tasks`)}
        aria-label="Задачи"
      />
      <Button
        type="button"
        icon="pi pi-pencil"
        rounded
        text
        onClick={() => openEditDialog(project)}
        aria-label="Редактировать"
      />
      <Button
        type="button"
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        onClick={() => confirmDelete(project)}
        aria-label="Удалить"
      />
    </div>
  );

  const dialogHeader = editingProject ? "Редактирование проекта" : "Новый проект";

  const onSubmit = async (data: ProjectFormData) => {
    if (editingProject) {
      await updateMutation.mutateAsync({
        id: editingProject.id,
        dto: { name: data.name, ...(data.description?.trim() ? { description: data.description.trim() } : {}) },
      });
      return;
    }
    await createMutation.mutateAsync({
      name: data.name,
      ...(data.description?.trim() ? { description: data.description.trim() } : {}),
    });
  };

  return (
    <div style={{ width: "100%", maxWidth: 1200, display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Проекты</h1>
        <Button label="Создать" icon="pi pi-plus" onClick={openCreateDialog} />
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span className="p-input-icon-left" style={{ flex: 1, minWidth: 260 }}>
          <i className="pi pi-search" />
          <InputText
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Поиск по названию/описанию"
            style={{ width: "100%" }}
          />
        </span>
      </div>

      <DataTable
        value={projects}
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
        loading={projectsQuery.isFetching}
        emptyMessage="Нет проектов"
        responsiveLayout="scroll"
      >
        <Column field="id" header="ID" style={{ width: 80 }} sortable />
        <Column field="name" header="Название" sortable />
        <Column field="description" header="Описание" />
        <Column header="Создан" body={createdAtBody} sortable field="createdAt" style={{ width: 220 }} />
        <Column header="Действия" body={actionsBody} style={{ width: 200 }} />
      </DataTable>

      <Dialog
        header={dialogHeader}
        visible={dialogOpen}
        onHide={() => setDialogOpen(false)}
        style={{ width: "100%", maxWidth: 640 }}
        modal
      >
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="name">Название</label>
            <InputText id="name" {...register("name")} className={errors.name ? "p-invalid" : ""} />
            {errors.name && <small style={{ color: "red" }}>{errors.name.message}</small>}
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="description">Описание</label>
            <InputTextarea id="description" {...register("description")} autoResize rows={3} />
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
              label={editingProject ? "Сохранить" : "Создать"}
              loading={createMutation.isPending || updateMutation.isPending}
              disabled={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
}
