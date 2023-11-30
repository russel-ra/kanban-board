import { useState } from "react";
import DeleteIcon from "../icons/DeleteIcon";
import { Id, Task } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = {
    task: Task;
    deleteTask: (taskId: Id) => void;
    updateTask: (taskId: Id, content: string) => void;
}

function TaskContainer({ task, deleteTask, updateTask }: Props) {
    const [hovering, setHovering] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task
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
            style={style}
            ref={setNodeRef}
            className="
            bg-mainBackgroundColor
            p-4
            h-[81px]
            min-h-[81px]
            flex
            items-center
            text-left
            rounded-xl
            cursor-grab
            border-2
            border-rose-500
            relative
            opacity-50
            "
            >
            </div>
        )
    }

    return (
        <div
        {...attributes} 
        {...listeners}
        style={style}
        ref={setNodeRef}
        className="
        bg-mainBackgroundColor
        p-4
        h-[81px]
        min-h-[81px]
        flex
        items-center
        text-left
        rounded-xl
        hover:ring-2
        hover:ring-rose-500
        cursor-grab
        relative
        "
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={() => {
            setEditMode(true);
            setHovering(false);
        }}
        >
            { !editMode && 
            <p
            className="
            my-auto h-full w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap
            ">
                { task.content }
            </p>
            }
            { editMode && 
            <textarea
            className="
            bg-mainBackgroundColor
            outline-none
            resize-none
            text-left
            w-full
            h-full
            "
            value={task.content}
            autoFocus
            onBlur={() => setEditMode(false)}
            onKeyDown={e => {
                if (e.key === "Enter" || e.key === "Escape") {
                    setEditMode(false);
                } else {
                    return;
                }
            }}
            onChange={(e) => updateTask(task.id, e.target.value)}
            />
            }

            { hovering && !editMode &&
            <button
            onClick={() => deleteTask(task.id)}
            className="
            stroke-white
            absolute
            right-4
            top-1/2
            -translate-y-1/2
            p-2
            bg-columnBackgroundColor
            opacity-60
            hover:opacity-100
            "
            >
                <DeleteIcon/>
            </button>
            }
        </div>
    )
}

export default TaskContainer;