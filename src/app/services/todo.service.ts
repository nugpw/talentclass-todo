import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Todo {
  id?: string;
  title: string;
  description: string;
  done: boolean;
  active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  todoSubject: BehaviorSubject<Todo[]> = new BehaviorSubject([] as Todo[]);
  lastId: number = 0;

  constructor(private readonly httpClient: HttpClient) {
  }

  get TodoSubject() {
    return this.todoSubject.asObservable();
  }

  getTodos() {
    this.httpClient
      .get<Todo[]>('http://localhost:3000/todo', {
        observe: 'body',
        reportProgress: true,
      })
      .pipe(
        map((t) =>
          t.map((todo) => {
            return { ...todo, active: false };
          })
        )
      )
      .subscribe({
        next: (data) => {
          console.log(data);
          this.todoSubject.next(data);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  setItems(todos: Todo[]) {
    this.todoSubject.next(todos);
    this.lastId = todos.length;
  }

  updateItem(todo: Todo) {
    const currentTodos: Todo[] = this.todoSubject.getValue();
    const currentItemIndex = currentTodos.findIndex((f) => f.id === todo.id);
    if (currentItemIndex > -1) {
      this.httpClient.put<Todo>('http://localhost:3000/todo', todo).subscribe({
        next: (data) => {
          data.active = true;
          currentTodos[currentItemIndex] = data;
          this.todoSubject.next(currentTodos);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  addItem(todo: Todo): Todo {
    const currentTodos: Todo[] = this.todoSubject.getValue();
    this.httpClient.post<Todo>('http://localhost:3000/todo', todo).subscribe({
      next: (data) => {
        data.active = true;
        todo = data;
        currentTodos.push(data);
        this.todoSubject.next(currentTodos);
      },
      error: (err) => {
        console.log(err);
      },
    });

    return todo;
  }

  deleteItem(id: string) {
    const currentTodos: Todo[] = this.todoSubject.getValue();
    const currentItemIndex = currentTodos.findIndex((f) => f.id === id);
    if (currentItemIndex > -1) {
      this.httpClient
        .delete<Todo>('http://localhost:3000/todo/' + id)
        .subscribe({
          next: (data) => {
            currentTodos.splice(currentItemIndex, 1);
            this.todoSubject.next(currentTodos);
          },
          error: (err) => {
            console.log(err);
          },
        });
    }
  }

  doneItem(id: string) {
    const currentTodos: Todo[] = this.todoSubject.getValue();
    const currentItemIndex = currentTodos.findIndex((f) => f.id === id);
    if (currentItemIndex > -1) {
      const todo = currentTodos[currentItemIndex];
      todo.done = true;

      this.httpClient.put<Todo>('http://localhost:3000/todo', todo).subscribe({
        next: (data) => {
          currentTodos[currentItemIndex].done = true;
          this.todoSubject.next(currentTodos);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }
}
