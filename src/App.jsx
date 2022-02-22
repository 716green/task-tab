import React, { useState, useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";

function App() {
  const activeRef = useRef();
  const [inputValue, setInputValue] = useState("");
  const [tasks, setTasks] = useState([]);
  const [focusedTask, setFocusedTask] = useState(null);

  const listenToKeypress = ({ key }) => {
    if (!focusedTask) return;
    let direction = "";
    const action = ["[", "]", "Enter", "Backspace"].indexOf(key);

    const i = getTaskIndex(focusedTask);

    if (action === -1) return;
    if (action === 0) direction = "left";
    else if (action === 1) direction = "right";

    const t = [...tasks];

    if (action === 2) {
      activeRef.current.blur();
      setFocusedTask(null);
      editTaskHandler();
      if (t[i].task.trim().length < 1) {
        t.splice(i, 1);
      }
    }

    if (!!t[i]) {
      const currentIndent = t[i].indent;

      if (direction === "right" && currentIndent < 5) {
        t[i].indent = currentIndent + 1;
      } else if (direction === "left" && currentIndent > 0) {
        t[i].indent = currentIndent - 1;
      }
    }

    setTasks(t);
  };

  useEffect(() => {
    document.addEventListener("keydown", listenToKeypress);
    return () => document.removeEventListener("keydown", listenToKeypress);
  }, [focusedTask]);

  const inputChangeHandler = (e) => setInputValue(e.target.value);

  const saveTaskHandler = (e) => {
    e.preventDefault();

    if (!inputValue.trim()?.length) return;
    const newTask = {
      id: uuid(),
      task: inputValue?.trim(),
      edit: false,
      indent: 0,
    };
    const t = [...tasks, newTask];
    setTasks(t);

    setInputValue("");
  };

  const editTaskHandler = (task) => {
    if (tasks?.length === 0) return;
    const t = [...tasks];
    for (let i in t) {
      t[i].edit = false;
    }

    if (!!task?.id) {
      setFocusedTask(task);
      const t = [...tasks];
      const taskIndex = getTaskIndex(task);
      t[taskIndex].edit = true;
      setTasks(t);
    } else setFocusedTask(null);
  };

  const getTaskIndex = (task) => {
    return [...tasks].findIndex((t) => t.id === task.id);
  };

  const eventEditHandler = (i, e) => {
    const t = [...tasks];
    t[i].task = e.target.value;
    setTasks(t);
  };

  const finishEditingHandler = (e) => {
    e.preventDefault();
    editTaskHandler();
  };

  return (
    <main>
      <div
        onClick={editTaskHandler}
        style={{
          width: "100%",
          height: "100%",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: -5,
        }}
      ></div>

      <section onClick={editTaskHandler}>
        <span style={{ width: "100%", display: "flex" }}>
          <h1 style={{ margin: "20px auto" }}>
            {tasks?.length} {tasks?.length === 1 ? "Task" : "Tasks"}
          </h1>
        </span>
        <form style={{ display: "flex" }}>
          <input
            style={{ margin: "auto 0" }}
            type="text"
            value={inputValue}
            onChange={inputChangeHandler}
          />
          <button style={{ display: "none" }} onClick={saveTaskHandler}>
            +
          </button>
        </form>
      </section>

      <div>
        <ul style={{ listStyle: "none" }}>
          {tasks?.length > 0 &&
            tasks?.map((task, i) => (
              <span
                key={i}
                style={{
                  display: "flex",
                  margin: "auto 0",
                  height: "40px",
                  marginLeft: task?.indent * 10 + "px",
                }}
              >
                <li
                  onClick={() => editTaskHandler(task)}
                  style={{ display: "flex", margin: "auto 0" }}
                >
                  {task?.edit ? (
                    <form onSubmit={finishEditingHandler}>
                      <input
                        ref={activeRef}
                        onBlur={editTaskHandler}
                        style={{
                          margin: "auto 0",
                          padding: 0,
                          border: 0,
                          outline: "none",
                          color: "slategray",
                        }}
                        onChange={(e) => eventEditHandler(i, e)}
                        value={task.task}
                      />
                    </form>
                  ) : (
                    <div style={{ width: "100%" }} onClick={editTaskHandler}>
                      {task.task}
                    </div>
                  )}
                </li>
              </span>
            ))}
        </ul>
      </div>
    </main>
  );
}

export default App;
