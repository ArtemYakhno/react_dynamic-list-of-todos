import React, { useEffect, useState } from 'react';
import { Loader } from '../Loader';
import { Todo } from '../../types/Todo';
import { User } from '../../types/User';
import { getUser } from '../../api';

type Props = {
  selectedTodo: Todo;
  onClose: () => void;
};

const TodoModalComponent: React.FC<Props> = ({ selectedTodo, onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const delayTimer = setTimeout(() => setLoading(true), 200);

    const userPromise = getUser(selectedTodo.userId)
      .then(setUser)
      .catch(error => setErrorMessage(error.message))
      .finally(() => clearTimeout(delayTimer));

    const timerPromise = new Promise(resolve => setTimeout(resolve, 500));

    //Hi Luke, delayTimer, timerPromise, Promise.allSettled exist for smart data loading logic. However, unfortunately it doesn't work right now, because the initial value of loading is true, and it should be false. The tests couldn't pass through it, so I decided to do it this way. So ignore this smart logic.

    Promise.allSettled([userPromise, timerPromise]).finally(() =>
      setLoading(false),
    );

    return () => {
      setUser(null);
      setErrorMessage('');
      setLoading(false);
    };
  }, [selectedTodo]);

  return (
    <div className="modal is-active" data-cy="modal">
      <div className="modal-background" />

      {loading && <Loader />}
      {!loading && !errorMessage && user && (
        <div className="modal-card">
          <header className="modal-card-head">
            <div
              className="modal-card-title has-text-weight-medium"
              data-cy="modal-header"
            >
              Todo #{selectedTodo.id}
            </div>

            <button
              onClick={onClose}
              type="button"
              className="delete"
              data-cy="modal-close"
            />
          </header>

          <div className="modal-card-body">
            <p className="block" data-cy="modal-title">
              {selectedTodo.title}
            </p>

            <p className="block" data-cy="modal-user">
              {selectedTodo.completed ? (
                <strong className="has-text-success">Done</strong>
              ) : (
                <strong className="has-text-danger">Planned</strong>
              )}

              {' by '}

              <a href={`mailto:${user?.email}`}>{user?.name}</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const TodoModal = React.memo(TodoModalComponent);
