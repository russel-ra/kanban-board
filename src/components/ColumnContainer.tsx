/*
TIME-STAMP: 44:00
*/
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import DeleteIcon from "../icons/DeleteIcon";
import { Column, Id, Task } from "../types";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import TaskContainer from "./TaskContainer";

type Props = {
    column: Column;
    deleteColumn: (id: Id) => void;
    updateColumn: (id: Id, title: string) => void;
    createTask: (id: Id) => void;
    tasks: Task[];
    deleteTask: (taskId: Id) => void;
    updateTask: (taskId: Id, content: string) => void;
}

function ColumnContainer(props: Props) {
    const { column, deleteColumn, updateColumn, createTask, tasks, deleteTask, updateTask } = props;

    const [editMode, setEditMode] = useState(false)

    const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);
    const taskCount = useMemo(() => tasks.filter(t => t.columnId === column.id).length, [tasks]);

    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column
        },
        disabled: editMode,
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    if (isDragging) {
        return (
        <div
        ref={setNodeRef}
        style={style}
        className="
        bg-columnBackgroundColor
        w-[350px]
        h-[500px]
        max-h-[500px]
        rounded-lg
        flex
        flex-col
        opacity-50
        border-2
        border-rose-500
        ">
        </div>
        )
    }

    return (
        <div
        ref={setNodeRef}
        style={style}
        className="
        bg-columnBackgroundColor
        w-[350px]
        h-[500px]
        max-h-[500px]
        rounded-lg
        flex
        flex-col
        ">

            {/* Column Title */}
            <div
            onClick={() => {
                setEditMode(true);
            }}
            {...attributes}
            {...listeners}
            className="
            bg-mainBackgroundColor
            text-md
            h-[60px]
            cursor-grab
            rounded-md
            rounded-b-none
            p-3
            font-bold
            border-columnBackgroundColor
            border-4
            flex
            items-centre
            justify-between
            ">
                <div className="flex gap-2 items-center">
                    <div
                    className="
                    flex
                    justify-center
                    items-center
                    bg-columnBackgroundColor
                    px-2
                    py-1
                    text-sm
                    rounded-full
                    w-[30px]
                    ">
                      { taskCount }
                    </div>

                    { !editMode && column.title }
                    { editMode &&
                     <input
                            className="
                            bg-black
                            focus:border-rose-500
                            border
                            rounded
                            outline-none
                            p-1
                            "
                            autoFocus
                            value={column.title}
                            onChange={e => updateColumn(column.id, e.target.value)}
                            onBlur={() => {
                                setEditMode(false);
                            }}
                            onKeyDown={e => {
                                if (e.key === "Enter" || e.key === "Escape") {
                                    setEditMode(false);
                                } else {
                                    return;
                                }
                            }}
                    /> }

                </div>

                <button
                onClick={() => {
                    deleteColumn(column.id)
                }} 
                className="
                stroke-gray-400
                hover:stroke-white
                ">
                    <DeleteIcon />
                </button>

            </div>


            {/* Column Body */}
            <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
                <SortableContext items={taskIds}>
                {tasks.map(t => (
                    <TaskContainer key={t.id} task={t} deleteTask={deleteTask} updateTask={updateTask} />
                ))}
                </SortableContext>
            </div>

            {/* Column Footer */}
            <button
            onClick={() => createTask(column.id)}
            className="
            flex
            gap-2
            p-4
            items-center
            border-columnBackgroundColor
            border-2
            rounded-md
            hover:bg-mainBackgroundColor
            hover:text-rose-500
            active:bg-black
            ">
                <PlusIcon/> Add Task
            </button>
        </div>
    );
}

export default ColumnContainer;