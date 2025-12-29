import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { Column } from "primereact/column";
import { DataTable, type DataTablePageEvent, type DataTableSortEvent } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Tag } from "primereact/tag";
import { confirmDialog } from "primereact/confirmdialog";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSearchParams } from "react-router";
import { z } from "zod";
import { getProjectTasks, getProjects, type Project } from "~/api/projects/projects-api";
import {
  normalizeApiError,
  normalizeBoolean,
  normalizeLimit,
  normalizeNumber,
  normalizePage,
  normalizeSearch,
  normalizeSortField,
  normalizeSortOrder,
  tryParseDate,
  type SortOrder,
} from "~/api/pagination";
import {
  createTask,
  deleteTask,
  getTasks,
  toggleTaskComplete,
  updateTask,
  type Task,
} from "~/api/tasks/tasks-api";
import { useToast } from "~/ui/base/toast-provider";
import { forcePrimeDialogRepaint } from "~/ui/base/primereact-dialog-workarounds";

type TasksPageProps = {
  forcedProjectId?: number;
};

const taskFormSchema = z.object({
  title: z.string().min(1, "Пожалуйста, введите название"),
  description: z.string().optional(),
  isCompleted: z.boolean(),
  priority: z.number().min(1).max(10).nullable().optional(),
  projectId: z.number().nullable().optional(),
  dueDate: z.date().nullable().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

type CompletionFilter = "all" | "completed" | "active";

function completionToApi(value: CompletionFilter): boolean | undefined {
  if (value === "completed") return true;
  if (value === "active") return false;
  return undefined;
}

function apiToCompletion(value: boolean | undefined): CompletionFilter {
  if (value === true) return "completed";
  if (value === false) return "active";
  return "all";
}

export function TasksPage({ forcedProjectId }: TasksPageProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = normalizePage(searchParams.get("page"), 1);
  const limit = normalizeLimit(searchParams.get("limit"), 10);
  const sortBy = normalizeSortField(searchParams.get("sortBy"), "createdAt");
  const sortOrder = normalizeSortOrder(searchParams.get("sortOrder"), "desc");
  const search = normalizeSearch(searchParams.get("search"));

  const isCompletedParam = normalizeBoolean(searchParams.get("isCompleted"));
  const priorityParam = normalizeNumber(searchParams.get("priority"));
  const projectIdParam = normalizeNumber(searchParams.get("projectId"));

  const effectiveProjectId = forcedProjectId ?? projectIdParam;

  const completionFilter = apiToCompletion(isCompletedParam);

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

  const projectsQuery = useQuery({
    queryKey: ["projects", "lookup"],
    queryFn: () =>
      getProjects({
        page: 1,
        limit: 100,
        sortBy: "name",
        sortOrder: "asc",
      }),
    enabled: forcedProjectId === undefined,
    placeholderData: keepPreviousData,
  });

  const projects = projectsQuery.data?.items ?? [];

  const projectById = useMemo(() => {
    const map = new Map<number, Project>();
    for (const p of projects) map.set(p.id, p);
    return map;
  }, [projects]);

  const tasksQuery = useQuery({
    queryKey: [
      "tasks",
      forcedProjectId ?? null,
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      isCompletedParam ?? null,
      priorityParam ?? null,
      effectiveProjectId ?? null,
    ],
    queryFn: () => {
      if (forcedProjectId !== undefined) {
        return getProjectTasks(forcedProjectId, {
          page,
          limit,
          sortBy,
          sortOrder,
          search,
          isCompleted: isCompletedParam,
          priority: priorityParam ?? undefined,
        });
      }

      return getTasks({
        page,
        limit,
        sortBy,
        sortOrder,
        search,
        isCompleted: isCompletedParam,
        priority: priorityParam ?? undefined,
        projectId: effectiveProjectId ?? undefined,
      });
    },
    placeholderData: keepPreviousData,
  });

  const tasks = tasksQuery.data?.items ?? [];
  const total = tasksQuery.data?.total ?? 0;

  const sortOrderValue = sortOrder === "asc" ? 1 : -1;
  const first = (page - 1) * limit;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      isCompleted: false,
      priority: null,
      projectId: forcedProjectId ?? null,
      dueDate: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.show({
        severity: "success",
        summary: "Успешно",
        detail: "Задача создана",
        life: 2500,
      });
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.show({
        severity: "error",
        summary: "Ошибка",
        detail: normalizeApiError(error),
        life: 3500,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<TaskFormData> }) =>
      updateTask(id, {
        title: dto.title,
        description: dto.description,
        isCompleted: dto.isCompleted,
        priority: dto.priority ?? undefined,
        projectId: (forcedProjectId ?? dto.projectId) ?? undefined,
        dueDate: dto.dueDate ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.show({
        severity: "success",
        summary: "Успешно",
        detail: "Задача обновлена",
        life: 2500,
      });
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.show({
        severity: "error",
        summary: "Ошибка",
        detail: normalizeApiError(error),
        life: 3500,
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleTaskComplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.show({
        severity: "success",
        summary: "Готово",
        detail: "Статус задачи обновлён",
        life: 2000,
      });
    },
    onError: (error) => {
      toast.show({
        severity: "error",
        summary: "Ошибка",
        detail: normalizeApiError(error),
        life: 3500,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.show({
        severity: "success",
        summary: "Удалено",
        detail: "Задача удалена",
        life: 2000,
      });
    },
    onError: (error) => {
      toast.show({
        severity: "error",
        summary: "Ошибка",
        detail: normalizeApiError(error),
        life: 3500,
      });
    },
  });

  const openCreateDialog = () => {
    setEditingTask(null);
    reset({
      title: "",
      description: "",
      isCompleted: false,
      priority: null,
      projectId: forcedProjectId ?? (effectiveProjectId ?? null),
      dueDate: null,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    reset({
      title: task.title ?? "",
      description: task.description ?? "",
      isCompleted: !!task.isCompleted,
      priority: task.priority ?? null,
      projectId: forcedProjectId ?? task.projectId ?? null,
      dueDate: tryParseDate(task.dueDate),
    });
    setDialogOpen(true);
  };

  const confirmDelete = (task: Task) => {
    confirmDialog({
      header: "Удалить задачу?",
      message: `Удалить «${task.title}»?`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Удалить",
      rejectLabel: "Отмена",
      acceptClassName: "p-button-danger",
      accept: () => deleteMutation.mutate(task.id),
    });
  };

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

  const handleCompletionFilterChange = (value: CompletionFilter) => {
    const apiValue = completionToApi(value);
    updateParams({
      isCompleted: apiValue === undefined ? null : String(apiValue),
      page: "1",
    });
  };

  const handlePriorityChange = (value: number | null) => {
    updateParams({
      priority: value ? String(value) : null,
      page: "1",
    });
  };

  const handleProjectChange = (value: number | null) => {
    updateParams({
      projectId: value ? String(value) : null,
      page: "1",
    });
  };

  const statusBody = (task: Task) => {
    return task.isCompleted ? (
      <Tag value="Готово" severity="success" />
    ) : (
      <Tag value="В работе" severity="info" />
    );
  };

  const priorityBody = (task: Task) => {
    if (task.priority === null || task.priority === undefined) return <span>-</span>;
    return <Tag value={String(task.priority)} severity={task.priority >= 3 ? "danger" : "warning"} />;
  };

  const projectBody = (task: Task) => {
    if (forcedProjectId !== undefined) return <span>{forcedProjectId}</span>;
    const id = task.projectId ?? null;
    if (!id) return <span>-</span>;
    return <span>{projectById.get(id)?.name ?? `#${id}`}</span>;
  };

  const dateBody = (task: Task) => {
    const d = tryParseDate(task.dueDate);
    if (!d) return <span>-</span>;
    return <span>{d.toLocaleString()}</span>;
  };

  const createdAtBody = (task: Task) => {
    const d = tryParseDate(task.createdAt);
    if (!d) return <span>-</span>;
    return <span>{d.toLocaleString()}</span>;
  };

  const actionsBody = (task: Task) => (
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <Button
        type="button"
        icon="pi pi-pencil"
        rounded
        text
        onClick={() => openEditDialog(task)}
        aria-label="Редактировать"
      />
      <Button
        type="button"
        icon={task.isCompleted ? "pi pi-refresh" : "pi pi-check"}
        rounded
        text
        onClick={() => toggleMutation.mutate(task.id)}
        aria-label="Сменить статус"
      />
      <Button
        type="button"
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        onClick={() => confirmDelete(task)}
        aria-label="Удалить"
      />
    </div>
  );

  const projectOptions = useMemo(() => {
    const opts = projects
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p) => ({ label: p.name, value: p.id }));
    return [{ label: "Все проекты", value: null }, ...opts];
  }, [projects]);

  const completionOptions: { label: string; value: CompletionFilter }[] = [
    { label: "Все", value: "all" },
    { label: "В работе", value: "active" },
    { label: "Готово", value: "completed" },
  ];

  const priorityOptions = [
    { label: "Любой приоритет", value: null },
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "3", value: 3 },
    { label: "4", value: 4 },
    { label: "5", value: 5 },
    { label: "6", value: 6 },
    { label: "7", value: 7 },
    { label: "8", value: 8 },
    { label: "9", value: 9 },
    { label: "10", value: 10 },
  ];

  const dialogHeader = editingTask ? "Редактирование задачи" : "Новая задача";

  const onSubmit = async (data: TaskFormData) => {
    if (editingTask) {
      await updateMutation.mutateAsync({ id: editingTask.id, dto: data });
      return;
    }
    await createMutation.mutateAsync({
      title: data.title,
      description: data.description,
      isCompleted: data.isCompleted,
      priority: data.priority ?? undefined,
      projectId: (forcedProjectId ?? data.projectId) ?? undefined,
      dueDate: data.dueDate ?? undefined,
    });
  };

  return (
    <div style={{ width: "100%", maxWidth: 1200, display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
          {forcedProjectId ? `Задачи проекта #${forcedProjectId}` : "Список задач"}
        </h1>
        <Button label="Создать" icon="pi pi-plus" onClick={openCreateDialog} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <span className="p-input-icon-left" style={{ flex: 1, minWidth: 260 }}>
            <i className="pi pi-search" />
            <InputText
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Поиск (title/description)"
              style={{ width: "100%" }}
            />
          </span>

          <Dropdown
            value={completionFilter}
            options={completionOptions}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => handleCompletionFilterChange(e.value)}
            placeholder="Статус"
            style={{ minWidth: 180 }}
          />

          <Dropdown
            value={priorityParam ?? null}
            options={priorityOptions}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => handlePriorityChange(e.value)}
            placeholder="Приоритет"
            style={{ minWidth: 180 }}
          />

          {forcedProjectId === undefined && (
            <Dropdown
              value={projectIdParam ?? null}
              options={projectOptions}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => handleProjectChange(e.value)}
              placeholder="Проект"
              style={{ minWidth: 220 }}
              loading={projectsQuery.isFetching}
            />
          )}
        </div>

        <DataTable
          value={tasks}
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
          loading={tasksQuery.isFetching}
          emptyMessage="Нет задач"
          responsiveLayout="scroll"
        >
          <Column field="id" header="ID" style={{ width: 80 }} sortable />
          <Column field="title" header="Название" sortable />
          <Column header="Проект" body={projectBody} style={{ width: 220 }} />
          <Column header="Приоритет" body={priorityBody} style={{ width: 140 }} sortable field="priority" />
          <Column header="Статус" body={statusBody} style={{ width: 140 }} sortable field="isCompleted" />
          <Column header="Срок" body={dateBody} style={{ width: 220 }} sortable field="dueDate" />
          <Column header="Создана" body={createdAtBody} style={{ width: 220 }} sortable field="createdAt" />
          <Column header="Действия" body={actionsBody} style={{ width: 180 }} />
        </DataTable>
      </div>

      <Dialog
        header={dialogHeader}
        visible={dialogOpen}
        onHide={() => setDialogOpen(false)}
        onShow={forcePrimeDialogRepaint}
        style={{ width: "100%", maxWidth: 720 }}
        appendTo={typeof window !== "undefined" ? document.body : undefined}
        baseZIndex={3500}
        blockScroll
        modal
      >
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="title">Название</label>
            <InputText
              id="title"
              {...register("title")}
              className={errors.title ? "p-invalid" : ""}
            />
            {errors.title && <small style={{ color: "red" }}>{errors.title.message}</small>}
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="description">Описание</label>
            <InputTextarea id="description" {...register("description")} autoResize rows={3} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label>Проект</label>
              <Controller
                control={control}
                name="projectId"
                render={({ field }) => (
                  <Dropdown
                    value={forcedProjectId ?? field.value ?? null}
                    disabled={forcedProjectId !== undefined}
                    options={
                      forcedProjectId !== undefined
                        ? [{ label: `#${forcedProjectId}`, value: forcedProjectId }]
                        : projectOptions.slice(1)
                    }
                    optionLabel="label"
                    optionValue="value"
                    onChange={(e) => field.onChange(e.value)}
                    placeholder="Выберите проект"
                    style={{ width: "100%" }}
                  />
                )}
              />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label>Приоритет</label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <InputNumber
                    value={field.value ?? null}
                    onValueChange={(e) => field.onChange(e.value ?? null)}
                    min={1}
                    max={10}
                    showButtons
                  />
                )}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label>Срок</label>
              <Controller
                control={control}
                name="dueDate"
                render={({ field }) => (
                  <Calendar
                    value={field.value ?? null}
                    onChange={(e) => field.onChange(e.value ?? null)}
                    showTime
                    hourFormat="24"
                    dateFormat="yy-mm-dd"
                    showIcon
                  />
                )}
              />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label>Статус</label>
              <Controller
                control={control}
                name="isCompleted"
                render={({ field }) => (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, height: 40 }}>
                    <Checkbox
                      inputId="isCompleted"
                      checked={!!field.value}
                      onChange={(e) => field.onChange(!!e.checked)}
                    />
                    <label htmlFor="isCompleted">Готово</label>
                  </div>
                )}
              />
            </div>
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
              label={editingTask ? "Сохранить" : "Создать"}
              loading={createMutation.isPending || updateMutation.isPending}
              disabled={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
}
