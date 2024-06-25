import React, { useState, useEffect } from 'react';
import './App.css';

// Todoアイテムのプロパティ型定義
type TodoItemProps = {
  todo: { text: string; isCompleted: boolean; deadline: string };
  index: number;
  handleDeleteTodo: (index: number) => void;
  handleToggleTodo: (index: number) => void;
  handleSetDeadline: (index: number, deadline: string) => void;
};

// Todo情報の型定義
type TodoInfo = {
  text: string;
  isCompleted: boolean;
  deadline: string;
};

// Todoアイテムコンポーネント
const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  index,
  handleDeleteTodo,
  handleToggleTodo,
  handleSetDeadline,
}) => {
  const [editDeadlineMode, setEditDeadlineMode] = useState(false);
  const [deadlineInput, setDeadlineInput] = useState(todo.deadline.replace('T', ' '));

  const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeadlineInput(e.target.value);
  };

  const handleSetDeadlineClick = () => {
    handleSetDeadline(index, deadlineInput.replace(' ', 'T'));
    setEditDeadlineMode(false);
  };

  const isDeadlineExpired = new Date(todo.deadline) < new Date();
  const isDeadlineToday = new Date(todo.deadline).toDateString() === new Date().toDateString();
  // 期限が現在から24時間以内かどうかを判断
  const isDeadlineWithin24Hours = new Date(todo.deadline).getTime() - new Date().getTime() <= 86400000 && new Date(todo.deadline) > new Date();

  const handleDeleteClick = () => {
    handleDeleteTodo(index);
  };

  return (
    <div className={`task-card ${isDeadlineExpired ? 'overdue' : ''}`}>
      <input
        type="checkbox"
        checked={todo.isCompleted}
        onChange={() => handleToggleTodo(index)}
      />
      <span
        className="task-text"
        style={{
          textDecoration: todo.isCompleted ? 'line-through' : 'none',
          color: isDeadlineExpired ? 'red' : isDeadlineWithin24Hours ? 'blue' : 'inherit',// 期限が24時間以内の場合は青色で表示
          fontWeight: isDeadlineToday || isDeadlineWithin24Hours ? 'bold' : 'normal', // 期限が今日または24時間以内の場合は太字
        }}
      >
        {todo.text + " "}
      </span>
      {todo.deadline && (
        <>
          {editDeadlineMode ? (
            <input
              type="datetime-local"
              value={deadlineInput}
              onChange={handleDeadlineChange}
              style={{ color: isDeadlineExpired ? 'red' : 'inherit' }}
            />
          ) : (
            <span
              className="deadline"
              style={{
                cursor: 'pointer',
                textDecoration: 'underline',
                color: isDeadlineExpired ? 'red' : isDeadlineWithin24Hours ? 'blue' : 'inherit', // 期限が24時間以内の場合は青色で表示
              }}
              onClick={() => setEditDeadlineMode(true)}
            >
              {new Date(todo.deadline).toLocaleString()}
            </span>
          )}
          {editDeadlineMode && (
            <button className="set-deadline-btn" onClick={handleSetDeadlineClick}>
              Set Deadline
            </button>
          )}
        </>
      )}
      <button className="delete-btn" onClick={handleDeleteClick}>
        Clear!
      </button>
      {isDeadlineExpired && !todo.isCompleted && (
        <span className="warning-msg" style={{ color: 'red', fontWeight: 'bold' }}>
          警告！
        </span>
      )}
      {isDeadlineToday && !isDeadlineExpired && (
        <span className="urgent-msg" style={{ color: 'blue' }}>
          急げ！
        </span>
      )}
      {isDeadlineWithin24Hours && !isDeadlineExpired && !isDeadlineToday && (
        <span className="urgent-msg" style={{ color: 'blue' }}>
          24時間以内！
        </span>
      )}
    </div>
  );
};

// アプリケーションのメインコンポーネント
function App() {
  const initialTodos = () => {
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [] as TodoInfo[];
  };

  const [todos, setTodos] = useState<TodoInfo[]>(initialTodos);
  const [inputValue, setInputValue] = useState('');
  const [deadlineInput, setDeadlineInput] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [taskCount, setTaskCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [overduePercentage, setOverduePercentage] = useState<number>(0);
  const [todayTaskCount, setTodayTaskCount] = useState(0);
  const [todayTaskPercentage, setTodayTaskPercentage] = useState<number>(0);
  const [duplicateCount, setDuplicateCount] = useState<number>(1);
  const [repeatInterval, setRepeatInterval] = useState(1); // デフォルトは1日
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
    const taskCount = todos.length;
    setTaskCount(taskCount);

    const overdueTasks = todos.filter(todo => new Date(todo.deadline) < new Date() && !todo.isCompleted);
    setOverdueCount(overdueTasks.length);
    setOverduePercentage((overdueTasks.length / taskCount) * 100);

    const todayTasks = todos.filter(todo => new Date(todo.deadline).toDateString() === new Date().toDateString());
    setTodayTaskCount(todayTasks.length);
    setTodayTaskPercentage((todayTasks.length / taskCount) * 100);
  }, [todos]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleAddTodo = () => {
    let duplicatedTodos = [];
  
    for (let i = 0; i < duplicateCount; i++) {
      const deadlineDate = new Date(deadlineInput);
      deadlineDate.setDate(deadlineDate.getDate() + (repeatInterval * i)); // 繰り返し間隔を考慮
  
      // 時間情報を含めるように変更
      const newTodo = {
        text: inputValue + " ",
        isCompleted: false,
        deadline: deadlineDate.toISOString(), // YYYY-MM-DDTHH:MM:SS.sssZ形式
      };
  
      duplicatedTodos.push(newTodo);
    }
  
    setTodos(prevTodos => [...duplicatedTodos, ...prevTodos]);
    setInputValue('');
  };
  const handleDeleteTodo = (index: number) => {
    setTodos(prevTodos => prevTodos.filter((_, todoIndex) => todoIndex !== index));
  };

  const handleToggleTodo = (index: number) => {
    setTodos(prevTodos => prevTodos.map((todo, todoIndex) => todoIndex === index ? { ...todo, isCompleted: !todo.isCompleted } : todo));
  };

  const handleSetDeadline = (index: number, deadline: string) => {
    const newDeadline = deadline || prompt("締め切り日時が入力されていません。日時を入力してください（例：2023-12-31）");
    if (!newDeadline) return;
    setTodos((prevTodos) =>
      prevTodos.map((todo, todoIndex) =>
        todoIndex === index ? { ...todo, deadline: newDeadline } : todo
      )
    );
  };

  const sortedTodos = [...todos].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const hasOverdueTasks = overdueCount > 0;
  const hasTodayTasks = todayTaskCount > 0;

  // タスク一覧をエクスポートする機能
  const exportTodos = async () => {
    const todoTexts = todos.map((todo, index) => {
      // ISO形式の日付からTをスペースに置換し、末尾の000Zを除外
      const formattedDeadline = todo.deadline.replace('T', ' ').substring(0, todo.deadline.length - 5);
      return `${index + 1}, ${todo.text}, 締切: ${formattedDeadline}, 完了: ${todo.isCompleted ? 'はい' : 'いいえ'}`;
    }).join('\n');
  
    const blob = new Blob([todoTexts], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'TodoList.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <>
      <h1>Todo List</h1>
      {hasOverdueTasks && (
        <div className="overdue-warning">
          <p style={{ color: 'red', fontWeight: 'bold' }}>警告！期限切れのタスクがあります！</p>
        </div>
      )}
      {hasTodayTasks && (
        <div className="today-urgent">
          <p style={{ color: 'blue', fontWeight: 'bold' }}>今日のタスクがあります！</p>
        </div>
      )}
      <div>
        <p>Now: {currentDateTime.toLocaleString()}</p>
        <p>Total Tasks: {taskCount}</p>
        <p>Overdue Tasks: {overdueCount} ({overduePercentage.toFixed(2)}%)</p>
        <p>Today's Tasks: {todayTaskCount} ({todayTaskPercentage.toFixed(2)}%)</p>
        {taskCount === 0 && <p>No tasks to do!</p>}
      </div>

      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
      />
      <input
        type="datetime-local"
        value={deadlineInput}
        onChange={(e) => setDeadlineInput(e.target.value)}
      />
      <input
        type="number"
        placeholder="Duplicate Count"
        onChange={(e) => setDuplicateCount(Number(e.target.value))}
      />
      <input
        type="number"
        value={repeatInterval}
        onChange={(e) => setRepeatInterval(Number(e.target.value))}
        placeholder="繰り返し間隔（日）"
      />
      <button onClick={handleAddTodo}>Add Task</button>
      <button onClick={exportTodos}>Export Task List</button>
      <div className="task-list">
        {sortedTodos.map((todo, index) => (
          <TodoItem
            key={index}
            todo={todo}
            index={index}
            handleDeleteTodo={handleDeleteTodo}
            handleToggleTodo={handleToggleTodo}
            handleSetDeadline={handleSetDeadline}
          />
        ))}
      </div>
    </>
  );
}

export default App;