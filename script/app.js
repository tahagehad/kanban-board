class CreatTaskComponent {
    constructor(type, id) {
      this.type = type;
      this.parantTasksList = document.querySelector(`#${this.type}-tasks ul`);
      this.taskId = id;
    }
    creatTaskElement = (taskValue, isDisabled = false) => {
      const creatTaskEl = document.createElement("li");
      creatTaskEl.id = this.taskId;
      creatTaskEl.setAttribute("draggable", "true");
      creatTaskEl.innerHTML = `
      <div class="task-container">
      <input class="task-input" type="text" placeholder="Task" value='${taskValue}' ${
        isDisabled ? "disabled" : ""
      } required/>
      <i class="action-icon edit-task fa-regular fa-pen-to-square"></i>
      <i class="action-icon remove-task fa-sharp fa-solid fa-trash"></i>
      </div>
      <div class='error-box'>
      <small class="error-message"> Please Add a task </small>
      </div>
      `;
      this.parantTasksList.append(creatTaskEl);
      return creatTaskEl;
    };
  }
  
  class SwitchTasks {
    static tasksListObjects(started, progress, completed) {
      this.startedTasks = started;
      this.progressTasks = progress;
      this.completedTasks = completed;
    }
    static DataOfTaks() {
      const data = {
        started: this.startedTasks,
        progress: this.progressTasks,
        completed: this.completedTasks,
      };
      return data;
    }
    static switchTask(taskId = null, to = null) {
      const getTasksData = this.DataOfTaks();
      for (const taskArr in getTasksData) {
        for (const taskObj of getTasksData[taskArr].tasks) {
          if (taskObj.id === taskId) {
            getTasksData[taskArr].removeTaskHandler(taskId);
            getTasksData[taskArr].saveTasksToLocalStorage();
            getTasksData[to].tasks.push(taskObj);
            getTasksData[to].saveTasksToLocalStorage();
            console.log(`Task Id ${taskId} most go from ${taskArr} to ${to}`);
          }
        }
      }
    }
  }
  
  class TaskItem {
    constructor(
      type,
      id,
      removeTaskHandler,
      updateTaskValue,
      taskValue = "",
      isDisabled = false,
      submitTaskstatus = false
    ) {
      this.type = type;
      this.taskID = id;
      this.submitTask = submitTaskstatus;
      this.taskValue = taskValue;
      this.isDisabled = isDisabled;
      this.taskElement = new CreatTaskComponent(
        this.type,
        this.taskID
      ).creatTaskElement(this.taskValue, this.isDisabled);
      this.updateTaskValueHandler = updateTaskValue;
      this.removeTaskHandler = removeTaskHandler;
      this.lockInputByEnter();
      this.lockInputByBodyClick();
      this.editInputField();
      this.removeElement();
      this.connectDrag();
    }
  
    // 1
    lockInputByEnter = () => {
      const inputField = this.taskElement.querySelector("input");
      const error = this.taskElement.querySelector(".error-message");
      inputField.addEventListener("keypress", (e) => {
        if (e.key !== "Enter") return;
        if (e.target.value.trim()) {
          e.target.disabled = true;
          error.classList.remove("show");
          inputField.classList.remove("active-box-shadow");
          inputField.classList.remove("input-error");
          if (this.submitTask) return;
          this.updateTaskValueHandler(this.taskElement, this.taskID);
          this.submitTask = true;
        } else {
          error.classList.add("show");
          inputField.classList.add("input-error");
        }
      });
    };
  
    // 2
    lockInputByBodyClick = () => {
      const inputField = this.taskElement.querySelector("input");
      const error = this.taskElement.querySelector(".error-message");
      document.body.addEventListener("click", (e) => {
        if (["button", "i", "input"].includes(e.target.localName)) return;
        if (inputField.value.trim()) {
          inputField.disabled = true;
          error.classList.remove("show");
          inputField.classList.remove("input-error");
          inputField.classList.remove("active-box-shadow");
          if (this.submitTask) return;
          this.updateTaskValueHandler(this.taskElement, this.taskID);
          this.submitTask = true;
        } else {
          error.classList.add("show");
          inputField.classList.add("input-error");
        }
      });
    };
  
    // 3
    editInputField = () => {
      const inputField = this.taskElement.querySelector("input");
      const editElement = this.taskElement.querySelector(".edit-task");
      editElement.addEventListener("click", () => {
        const input = this.taskElement.querySelector("input");
        inputField.classList.add("active-box-shadow");
        input.disabled = false;
      });
    };
  
    // 4
    removeElement = () => {
      const removeElement = this.taskElement.querySelector(".remove-task");
      removeElement.addEventListener("click", () => {
        this.taskElement.remove();
        this.removeTaskHandler(this.taskID);
      });
    };
  
    connectDrag = () => {
      const taskItem = document.getElementById(this.taskID);
      taskItem.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", this.taskID);
        event.dataTransfer.effectAllowed = "move";
      });
    };
  }
  
  class TasksList {
    tasks = [];
    constructor(type) {
      this.type = type;
      this.parantTasksList = document.querySelector(`#${this.type}-tasks`);
      this.taskList = this.parantTasksList.querySelector("ul");
      this.taskAddBtn = this.parantTasksList.querySelector("button");
      this.taskAddBtn.addEventListener("click", this.creatTaskEl.bind(this));
      this.getTasksFromLocalStorage();
      this.connectDroppable();
    }
  
    generateRandomID = () => `task-${Math.floor(Math.random() * 1000000)}`;
  
    removeTaskHandler = (taskID) => {
      if (this.tasks.find((task) => task.id === taskID)) {
        this.tasks = this.tasks.filter((task) => task.id !== taskID);
        this.saveTasksToLocalStorage();
      }
    };
  
    updateTaskValue = (taskElement, taskID) => {
      if (!this.tasks) return;
      const inputField = taskElement.querySelector("input");
      this.tasks.forEach((task) => {
        if (task.id === taskID) {
          task.input = inputField.value;
        }
      });
      this.saveTasksToLocalStorage();
    };
  
    saveTasksToLocalStorage = () => {
      if (!this.tasks) return;
      localStorage.setItem(
        `${this.type}TasksData`,
        JSON.stringify([...this.tasks])
      );
    };
  
    clearTaskListData = () => {
      this.tasks = [];
      localStorage.removeItem(`${this.type}TasksData`);
    };
  
    getTasksFromLocalStorage = () => {
      const tasksData = JSON.parse(localStorage.getItem(`${this.type}TasksData`));
      if (!tasksData) return;
      this.tasks = [...tasksData];
      this.tasks.forEach((task) => {
        new TaskItem(
          this.type,
          task.id,
          this.removeTaskHandler.bind(this),
          this.updateTaskValue.bind(this),
          task.input,
          true
        );
      });
    };
  
    creatTaskEl = () => {
      const taskID = this.generateRandomID();
      this.tasks.push({ id: taskID, input: "" });
      new TaskItem(
        this.type,
        taskID,
        this.removeTaskHandler.bind(this),
        this.updateTaskValue.bind(this)
      );
    };
  
    connectDroppable = () => {
      this.taskList.addEventListener("dragenter", (event) => {
        if (event.dataTransfer.types[0] !== "text/plain") return;
        event.preventDefault();
        this.taskList.classList.add("dropable");
      });
      this.taskList.addEventListener("dragover", (event) => {
        if (event.dataTransfer.types[0] !== "text/plain") return;
        event.preventDefault();
      });
      this.taskList.addEventListener("dragleave", (event) => {
        if (
          event.relatedTarget.closest(`#${this.type}-tasks ul`) === this.taskList
        )
          return;
        this.taskList.classList.remove("dropable");
      });
      this.taskList.addEventListener("drop", (event) => {
        const taskID = event.dataTransfer.getData("text/plain");
        const taskItem = document.getElementById(taskID);
        this.taskList.append(taskItem);
        this.taskList.classList.remove("dropable");
        event.preventDefault();
        if (this.tasks.find((task) => task.id === taskID)) return;
        SwitchTasks.switchTask(taskID, this.type);
      });
    };
  }
  
  class App {
    static init() {
      this.startedTasksList = new TasksList("started");
      this.progressTasksList = new TasksList("progress");
      this.completedTasksList = new TasksList("completed");
      this.submitProjectTitle = true;
      SwitchTasks.tasksListObjects(
        this.startedTasksList,
        this.progressTasksList,
        this.completedTasksList
      );    
    }  
  
  }
  
  App.init();
  