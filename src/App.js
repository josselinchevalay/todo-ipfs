import React, {Component} from 'react';
import IPFS from 'ipfs';
import './App.css';
import Lowdb from 'lowdb';
import Adapter from 'ipfs-lowdb-adapter';
import Web3 from 'web3';

class App extends Component {

  constructor() {
    super();    
    this.state = {
      node : null,
      db : null,
      web3 : null,
      todos : [ {content :"", isCompleted : false}]
    }
  }

  componentDidMount() {
    IPFS.create().then(this.initializeState.bind(this));
  }

  initializeState(node) {
    let state = this.state;
    let adapter = new Adapter(node);
    let db = new Lowdb(adapter);
    state.db = db;
    state.node = node;
    state.adapter = adapter;
    state.web3 = new Web3('https://mainnet.infura.io/v3/a5a224951e5943fba29c5db776355d8c')
    state.web3.eth.accounts.create().then(console.log);
    db.defaults({todos : [
      {
        content: "Create your todo list",
        isCompleted : false
      }
    ]}).write().then( (db)=> {
      state.todos = db.todos;
      this.setState(state);
    });

     
  }

  setTodos(todos) {
    let state = this.state;
    state
      .db
      .set('todos', todos)
      .write().then((db) => {
        console.log(`last hash : ${state.adapter.lastHash}`);
        state.todos = db.todos;
        this.setState(state);});
    state.todos = todos
    this.setState(state);
  }

  handleKeyDown(e, i) {
    let todos = this.state.todos;
    if(e.key === 'Enter') {
      this.createTodoAtIndex(e, i);
    }
    if (e.key === 'Backspace' && todos[i].content === '') {
      e.preventDefault();
      return this.removeTodoAtIndex(i);
    }
  }

  createTodoAtIndex(e, i) {
    const newTodos = [...this.state.todos];
    newTodos.splice(i + 1, 0, {
      content: '',
      isCompleted: false,
    });
    this.setTodos(newTodos);
    setTimeout(() => {    
      document.forms[0].elements[i + 1].focus();
    }, 0);
  }

  updateTodoAtIndex(e, i) {
    let todos = this.state.todos;
    const newTodos = [...todos];
    newTodos[i].content = e.target.value;
    this.setTodos(newTodos);    
  }

  removeTodoAtIndex(i) {
    let todos = this.state.todos;
    if (i === 0 && todos.length === 1) return;
    this.setTodos(todos.slice(0, i).concat(todos.slice(i + 1, todos.length)));
    setTimeout(() => {
      document.forms[0].elements[i - 1].focus();
    }, 0);
  }

  toggleTodoCompleteAtIndex(index) {
    let todos = this.state.todos;
    const temporaryTodos = [...todos];
    temporaryTodos[index].isCompleted = !temporaryTodos[index].isCompleted;
    this.setTodos(temporaryTodos);
  }

  render() {
    const {todos} = this.state;

    return (
      <div className="App">
        <div className="header">
          <h3>Todo list</h3>
        </div>
        <form className="todo-list">
          <ul>
            {todos.map((todo, i) => (
              <div className={`todo ${todo.isCompleted && 'todo-is-completed'}`}>
              <div className={'checkbox'} onClick={() => this.toggleTodoCompleteAtIndex(i)}>
                {todo.isCompleted && (
                  <span>&#x2714;</span>
                )}
              </div>
              <input
                type="text"
                value={todo.content}
                onKeyDown={e => this.handleKeyDown(e, i)}
                onChange={e => this.updateTodoAtIndex(e, i)}
              />
            </div>
            
            ))}          
          </ul>
        </form>
      </div>
    );
  }
}

export default App;
