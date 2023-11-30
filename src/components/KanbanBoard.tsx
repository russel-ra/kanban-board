import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon"
import { Column, Id, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"; 
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskContainer from "./TaskContainer";

function KanbanBoard() {
    const [columns, setColumns] = useState<Column[]>([]);
    const columnsId = useMemo(() => columns.map(col => col.id), [columns]);
    const [columnCounter, setColumnCounter] = useState<number>(1);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskCounter, setTaskCounter] = useState<number>(1);

    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors =  useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 1, // unit here is px
            }
        })
    )

    return (
        <div className="
            m-auto
            flex
            min-h-screen
            w-full
            items-center
            overflow-x-auto
            overflow-y-hidden
            px-[40px]
        ">
            <DndContext
              sensors={sensors}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOver={onDragOver}
            >
                <div className="m-auto flex gap-5">
                    <div className="flex gap-5">
                        <SortableContext items={columnsId}>
                            {columns.map((col) => (
                                <ColumnContainer
                                    updateColumn={updateColumn}
                                    key={col.id}
                                    column={col}
                                    deleteColumn={deleteColumn} 
                                    createTask={createTask}
                                    tasks={tasks.filter(t => t.columnId === col.id)}
                                    deleteTask={deleteTask}
                                    updateTask={updateTask}
                                />
                            ))}
                        </SortableContext>
                    </div>

                    <button
                        className="
                        h-[60px]
                        w-[350px]
                        min-w-[350px]
                        cursor-pointer
                        rounded-lg
                        bg-mainBackgroundColor
                        p-4
                        ring-columnBackgroundColor
                        ring-2
                        hover:ring-rose-500
                        flex
                        gap-2.5
                        "
                        onClick={createColumn}>
                        <PlusIcon />
                        Add Column
                    </button>
                </div>
                {createPortal(
                // TODO: replace components here with dedicated dragoverlay components that don't require all those functions and stuff
                <DragOverlay>
                    {activeColumn &&
                         <ColumnContainer
                            updateColumn={updateColumn} 
                            column={activeColumn}
                            deleteColumn={deleteColumn}
                            createTask={createTask}
                            tasks={tasks.filter(t => t.columnId === activeColumn.id)}
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                        />
                    }
                    {activeTask &&
                        <TaskContainer
                            task={activeTask}
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                        />
                    }
                </DragOverlay>
                , document.body
                )}
            </DndContext>
        </div>
    );

    function createColumn() {
        const newColumn: Column = {
            id: generateId(),
            title: `Column ${columnCounter}`,
        }

        setColumns([...columns, newColumn]);
        setColumnCounter(columnCounter + 1);
    }

    function deleteColumn(id: Id): void {
        setColumns(prevColumns => prevColumns.filter(col => col.id !== id));
        setTasks(tasks => tasks.filter(t => t.columnId !== id));
    }

    function updateColumn(id: Id, title: string): void {
        setColumns(prevCol => prevCol.map(c => {
            if (c.id == id) {
                return {...c, title} // title here is equivalent to title: title
            } else {
                return c
            }
        }));
    }

    function createTask(columnId: Id): void {
        const newTask: Task = {
            id: generateId(),
            columnId,
            content: `Task ${taskCounter}`,
        };
        setTasks([...tasks, newTask]);
        setTaskCounter(taskCounter + 1);
    }

    function deleteTask(taskId: Id): void {
        setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
    }

    function updateTask(taskId: Id, content: string): void {
        setTasks(prevTasks => prevTasks.map(t => {
            if (t.id !== taskId) return t;
            return { ...t, content };
        }));
    }

    function generateId(): number {
        return Math.floor(Math.random() * 9999);
    }

    function onDragStart(event: DragStartEvent) {
        //console.log("DRAG START", event);
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current?.column);
            return;
        }

        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current?.task);
            return;
        }
    }

    function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null);
        setActiveTask(null);

        const { active, over } = event;

        if (!over) return;

        if (active.id == over.id) return;

        const activeIsColumn = active.data.current?.type === "Column";
        if (!activeIsColumn) return;


        setColumns(_ => {
            // TODO: a challenge would be to implement functionality without arrayMove
            const activeIndex = columns.findIndex(c => c.id === active.id);
            const overIndex = columns.findIndex(c => c.id === over.id);
            return arrayMove(columns, activeIndex, overIndex);
        });
    }

    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const activeIsTask = active.data.current?.type === "Task";
        const overIsTask = over.data.current?.type === "Task";

        // Dropping a Task over another Task
        if (activeIsTask && overIsTask) {
            setTasks(tasks => {
                const activeIndex = tasks.findIndex(t => t.id === activeId);
                const overIndex = tasks.findIndex(t => t.id === overId);

                if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
                    tasks[activeIndex].columnId = tasks[overIndex].columnId;
                    if (overIndex == 0) {
                        return arrayMove(tasks, activeIndex, overIndex)
                    } else {
                        return arrayMove(tasks, activeIndex, overIndex - 1)
                    }
                }

                return arrayMove(tasks, activeIndex, overIndex)
            })
        } 

        const overIsColumn = over.data.current?.type === "Column";

        // Dropping a Task over a Column
        if (activeIsTask && overIsColumn) {
            setTasks(tasks => tasks.map(t => {
                if (t.id !== active.id) return t;
                return {...t, columnId: over.id}
            }));
            
        }
    }

}

export default KanbanBoard