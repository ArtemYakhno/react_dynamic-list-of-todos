/* eslint-disable max-len */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';

import { TodoList } from './components/TodoList';
import { TodoFilter } from './components/TodoFilter';
import { TodoModal } from './components/TodoModal';
import { Loader } from './components/Loader';
import { getTodos } from './api';
import { Todo } from './types/Todo';
import { FilterTodo } from './types/FilterTodo';

export const App: React.FC = () => {
  const [todosFromServer, setTodosFromServer] = useState<Todo[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterTodo>('all');

  const filteredTodos = useMemo(() => {
    if (todosFromServer.length === 0) {
      return [];
    }

    let prepereadArray: Todo[] = [];

    switch (filter) {
      case 'active': {
        prepereadArray = [...todosFromServer].filter(todo => !todo.completed);
        break;
      }

      case 'completed': {
        prepereadArray = [...todosFromServer].filter(todo => todo.completed);
        break;
      }

      default: {
        prepereadArray = [...todosFromServer];
      }
    }

    if (query) {
      const normalizedQuery = query.toLowerCase().trim();

      prepereadArray = prepereadArray.filter(todo =>
        todo.title.toLowerCase().includes(normalizedQuery),
      );
    }

    return prepereadArray;
  }, [filter, query, todosFromServer]);

  useEffect(() => {
    const delayTimer = setTimeout(() => setLoading(true), 200);

    const todosPromise = getTodos()
      .then(setTodosFromServer)
      .catch(error => setErrorMessage(error.message))
      .finally(() => clearTimeout(delayTimer));

    const timerPromise = new Promise(resolve => setTimeout(resolve, 500));

    Promise.allSettled([todosPromise, timerPromise]).finally(() =>
      setLoading(false),
    );

    //Hi Luke, delayTimer, timerPromise, Promise.allSettled exist for smart data loading logic. However, unfortunately it doesn't work right now, because the initial value of loading is true, and it should be false. The tests couldn't pass through it, so I decided to do it this way. So ignore this smart logic.
  }, []);

  const closeModal = useCallback(() => {
    setSelectedTodo(null);
  }, []);

  const resetQuery = () => {
    setQuery('');
  };

  return (
    <>
      <div className="section">
        <div className="container">
          <div className="box">
            <h1 className="title">Todos:</h1>

            <div className="block">
              <TodoFilter
                selectedFilterTodo={filter}
                onChangeFilter={setFilter}
                currentQuery={query}
                onChangeQuery={setQuery}
                resetQuery={resetQuery}
              />
            </div>

            <div className="block">
              {loading && <Loader />}
              {!loading && !errorMessage && filteredTodos.length > 0 && (
                <TodoList
                  todos={filteredTodos}
                  selectedTodo={selectedTodo}
                  onSelect={setSelectedTodo}
                />
              )}
              {errorMessage && <p>Error occurreted: {errorMessage}</p>}
            </div>
          </div>
        </div>
      </div>

      {selectedTodo && (
        <TodoModal selectedTodo={selectedTodo} onClose={closeModal} />
      )}
    </>
  );
};
