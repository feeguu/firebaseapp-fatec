import {
  logout,
  deleteTask,
  addTask,
  updateTask,
  updateGroup,
  deleteGroup,
  addGroup,
} from "./firebase.js";

function syncEventListeners() {
  const logoutButton = document.getElementById("logout-button");
  const modalBackdrop = document.getElementById("modal-backdrop");
  const addTaskForm = document.getElementById("add-task-form");
  const expandButtons = document.querySelectorAll(".expand-area-button");
  const deleteTaskButtons = document.querySelectorAll(".delete-task-button");
  const editTaskButtons = document.querySelectorAll(".edit-task-button");
  const addTaskButtons = document.querySelectorAll(".add-task-button");
  const taskCheckboxes = document.querySelectorAll(".task-checkbox");
  const addGroupButton = document.getElementById("add-group-button");
  const editGroupButtons = document.querySelectorAll(".edit-group-button");
  const deleteGroupButtons = document.querySelectorAll(".delete-group-button");

  // clear all event listeners
  logoutButton.removeAllEventListeners();
  addTaskForm.removeAllEventListeners();
  expandButtons.forEach((button) => {
    button.removeAllEventListeners();
  });
  deleteTaskButtons.forEach((button) => {
    button.removeAllEventListeners();
  });
  editTaskButtons.forEach((button) => {
    button.removeAllEventListeners();
  });
  addTaskButtons.forEach((button) => {
    button.removeAllEventListeners();
  });
  taskCheckboxes.forEach((checkbox) => {
    checkbox.removeAllEventListeners();
  });
  addGroupButton.removeAllEventListeners();

  logoutButton.addEventListener("click", () => {
    logout().then(() => {
      window.location.href = "/login";
    });
  });

  editGroupButtons.forEach((button) => {
    const id = button.dataset.id;
    const groupName = document.getElementById(`group-name-${id}`);

    button.addEventListener("click", () => {
      console.log("Edit group button clicked", id);
      if (groupName.disabled) {
        button.innerText = "✔";
        groupName.disabled = false;
        groupName.classList.add("enabled:border-b-2");
      } else {
        button.innerText = "🖊";
        updateGroup(id, { name: groupName.value }).then(() => {
          console.log("Group updated");
        });
        groupName.disabled = true;
        groupName.classList.remove("enabled:border-b-2");
      }
    });
  });

  deleteGroupButtons.forEach((button) => {
    const id = button.dataset.id;
    const group = button.closest("section");

    button.addEventListener("click", () => {
      console.log("Deleting group with id:", id);
      deleteGroup(id).then(() => {
        console.log("Group deleted");
        group.remove();
      });
    });
  });

  expandButtons.forEach((button) => {
    const id = button.dataset.id;
    const content = document.querySelector(`[data-content="${id}"]`);

    button.addEventListener("click", () => {
      if (content.style.height === "0px" || content.style.height === "") {
        // Expand the content
        content.style.height = content.scrollHeight + "px";
      } else {
        // Collapse the content
        content.style.height = "0px";
      }
    });
  });

  taskCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const id = checkbox.dataset.id;
      const section = checkbox.closest("section");
      const group = section.dataset.id;

      updateTask(group, id, { completed: checkbox.checked }).then(() => {
        console.log("Task updated");
      });
    });
  });

  deleteTaskButtons.forEach((button) => {
    const id = button.dataset.id;
    const section = button.closest("section");
    const task = button.closest("li");

    const group = section.dataset.id;
    console.log("Group:", group);
    button.addEventListener("click", () => {
      console.log("Deleting task with id:", id);
      deleteTask(group, id).then(() => {
        console.log("Task deleted");
        task.remove();
      });
    });
  });

  editTaskButtons.forEach((button) => {
    const id = button.dataset.id;
    const task = button.closest("li");
    const group = task.closest("section").dataset.id;
    const taskName = task.querySelector(".task-name");

    button.addEventListener("click", () => {
      if (taskName.disabled) {
        button.innerText = "✔";
        taskName.disabled = false;
        taskName.classList.add("enabled:border-b-2");
      } else {
        button.innerText = "🖊";
        updateTask(group, id, { name: taskName.value }).then(() => {
          console.log("Task updated");
        });
        taskName.disabled = true;
        taskName.classList.remove("enabled:border-b-2");
      }
    });
  });

  addTaskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const sectionId = addTaskForm.dataset.sectionId;
    console.log("Adding task to group:", sectionId);
    addTask(sectionId, addTaskForm["name"].value, "").then((id) => {
      console.log("Task added");
      const task = `
                      <li>
                      <div class="flex w-full gap-2 py-2 justify-between items-center">
                          <div>
                              <input type="checkbox" data-id="${id}">
                              <input class="task-name bg-transparent p-1 rounded-sm border-amber-600 enabled:border"
                                  disabled type="text" class="text-lg" value="${addTaskForm["name"].value}" />
                          </div>
                          <div>
                              <button class=" delete-task-button bg-amber-600 rounded-sm p-1 self-end" data-id="${id}">
                                  🗑
                              </button>
  
                              <button class="edit-task-button bg-amber-600 rounded-sm p-1 self-end" data-id="${id}">
                                  🖊
                              </button>
                          </div>
  
                      </div>
                  </li>`;
      const content = document.querySelector(`[data-content="${sectionId}"]`);
      content.insertAdjacentHTML("beforeend", task);
      modalBackdrop.classList.add("hidden");
      modalBackdrop.classList.remove("flex");

      addTaskForm.reset();
      syncEventListeners();
    });
  });

  addTaskButtons.forEach((button) => {
    const sectionId = button.dataset.id;
    button.addEventListener("click", () => {
      addTaskForm.dataset.sectionId = sectionId;
      modalBackdrop.classList.remove("hidden");
      modalBackdrop.classList.add("flex");
    });
  });

  addGroupButton.addEventListener("click", () => {
    const main = document.querySelector("main");
    addGroup("New group").then((id) => {
      const section = `        <section class="w-full flex flex-col gap-2 bg-neutral-800 p-4 rounded-sm shadow-sm" data-id="{{id}}">
                <div class="w-full flex justify-between items-center">
                    <div class="flex w-full justify-between">
                        <input id="group-name-${id}" disabled type="text" class="text-xl bg-transparent border-amber-600 enabled:border-b-2" value="New group" />
                        <div class="flex gap-1">
                            <button class="edit-group-button bg-amber-600 rounded-sm p-1 self-end"
                                data-id="${id}">🖊</button>
                            <button class="delete-group-button bg-amber-600 rounded-sm p-1 self-end"
                                data-id="${id}">🗑</button>
                        </div>
                    </div>
                    <button data-id="${id}" class="expand-area-button fill-amber-600">
                        <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px">
                            <path d="M480-360 280-560h400L480-360Z" />
                        </svg>
                    </button>
                </div>
                <ul class="flex flex-col gap-1 transition-[height] overflow-hidden duration-300" data-content="{{id}}">
                    
                </ul>
                <button class="add-task-button self-end flex items-center text-amber-600 font-semibold" data-id="{{id}}">
                    adicionar tarefa
                </button>
            </section>`;
      main.insertAdjacentHTML("beforeend", section);
      syncEventListeners();
    });
  });
}

syncEventListeners();
