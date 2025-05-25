import { useState, useEffect } from 'react';
import { authService, graphService } from '../api';
import { GraphConfigData, SaveGraphRequest } from '../api/types';
import './Navbar.css';
import { Equation, GraphConfig } from '../types';

// Определяем пропсы
interface NavbarProps {
  equations: Equation[];
  config: GraphConfig;
  setEquations: (equations: Equation[]) => void;
  setConfig: (config: GraphConfig) => void;
}

const Navbar: React.FC<NavbarProps> = ({ equations, config, setEquations, setConfig }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isAuthenticated());
  const [username, setUsername] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedGraphs, setSavedGraphs] = useState<GraphConfigData[]>([]);
  
  // Form states
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [saveGraphData, setSaveGraphData] = useState({
    name: 'Мой график',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      setIsLoggedIn(isAuth);
      
      if (isAuth) {
        const user = authService.getCurrentUser();
        if (user) {
          setUsername(user.username);
        }
      }
    };
    
    checkAuth();
  }, []);
  
  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsLoggedIn(false);
      setUsername('');
      setShowAuthModal(false);
      
      // Сбрасываем уравнения и конфигурацию к базовым значениям
      const defaultData = await graphService.getDefaultData();
      setEquations(defaultData.equations.map(eq => ({
        id: String(eq.id),
        expression: eq.expression,
        color: eq.color,
        visible: eq.visible
      })));
      
      setConfig({
        xMin: defaultData.config.xMin,
        xMax: defaultData.config.xMax,
        yMin: defaultData.config.yMin,
        yMax: defaultData.config.yMax,
        xStep: defaultData.config.xStep,
        gridVisible: defaultData.config.gridVisible
      });
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };
  
  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setError('');
  };
  
  const closeAuthModal = () => {
    setShowAuthModal(false);
    setError('');
    // Reset form data
    setLoginData({ username: '', password: '' });
    setRegisterData({ username: '', email: '', password: '', confirmPassword: '' });
  };
  
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveGraphChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSaveGraphData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await authService.login({
        username: loginData.username,
        password: loginData.password
      });
      
      setIsLoggedIn(true);
      setUsername(response.username);
      closeAuthModal();

      // Загружаем данные пользователя после успешного входа
      try {
        const graphConfigs = await graphService.getGraphConfigs();
        
        if (graphConfigs.length > 0) {
          // Используем первую конфигурацию
          const config = graphConfigs[0];
          setConfig({
            xMin: config.xMin,
            xMax: config.xMax,
            yMin: config.yMin,
            yMax: config.yMax,
            xStep: config.xStep,
            gridVisible: config.gridVisible
          });
        }
        
        // Оставляем список уравнений пустым при входе
        setEquations([]);
      } catch (loadError) {
        console.error('Ошибка загрузки данных пользователя:', loadError);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Неверное имя пользователя или пароль');
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (registerData.password !== registerData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    try {
      console.log('Sending registration data to:', '/auth/register/');
      
      // First try to connect to the test endpoint
      try {
        const testResponse = await fetch('http://localhost:8000/api/auth/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (testResponse.ok) {
          console.log('Auth endpoint test successful:', await testResponse.json());
        } else {
          console.warn('Auth endpoint test failed:', await testResponse.text());
        }
      } catch (testErr) {
        console.error('Auth endpoint test error:', testErr);
      }
      
      const response = await authService.register({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password
      });
      
      setIsLoggedIn(true);
      setUsername(response.username);
      closeAuthModal();
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.response?.data) {
        // Format Django REST Framework error messages
        const errors = err.response.data;
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        setError(errorMessages);
      } else if (err.response?.status === 404) {
        setError('Ошибка 404: Эндпойнт не найден. Проверьте настройки сервера.');
      } else {
        setError(`Ошибка при регистрации: ${err.message || 'Неизвестная ошибка'}. Проверьте консоль для деталей.`);
      }
    }
  };
  
  const openSaveModal = () => {
    setSaveGraphData({
      name: 'Мой график',
      description: ''
    });
    setShowSaveModal(true);
    setError('');
  };
  
  const closeSaveModal = () => {
    setShowSaveModal(false);
    setError('');
  };
  
  const openLoadModal = async () => {
    setLoading(true);
    setError('');
    try {
      const graphs = await graphService.getSavedGraphs();
      setSavedGraphs(graphs);
      setShowLoadModal(true);
    } catch (err: any) {
      console.error('Error loading saved graphs:', err);
      setError(`Ошибка загрузки графиков: ${err.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const closeLoadModal = () => {
    setShowLoadModal(false);
    setError('');
  };
  
  const handleSaveGraph = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Подготавливаем данные для сохранения
      const saveData: SaveGraphRequest = {
        name: saveGraphData.name,
        description: saveGraphData.description,
        config: {
          xMin: config.xMin,
          xMax: config.xMax,
          yMin: config.yMin,
          yMax: config.yMax,
          xStep: config.xStep,
          gridVisible: config.gridVisible
        },
        equations: equations.map(eq => ({
          expression: eq.expression,
          color: eq.color,
          visible: eq.visible
        }))
      };
      
      await graphService.saveCurrentGraph(saveData);
      closeSaveModal();
      // Показываем уведомление об успешном сохранении
      alert('График успешно сохранен!');
    } catch (err: any) {
      console.error('Error saving graph:', err);
      setError(`Ошибка сохранения графика: ${err.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLoadGraph = async (graphId: number) => {
    setLoading(true);
    setError('');
    
    try {
      const graph = await graphService.getGraphConfig(graphId);
      
      // Обновляем состояние графика
      if (graph) {
        setConfig({
          xMin: graph.xMin,
          xMax: graph.xMax,
          yMin: graph.yMin,
          yMax: graph.yMax,
          xStep: graph.xStep,
          gridVisible: graph.gridVisible
        });
        
        // Загружаем только уравнения для выбранного графика
        if (graph.equations && graph.equations.length > 0) {
          setEquations(graph.equations.map(eq => ({
            id: String(eq.id),
            expression: eq.expression,
            color: eq.color,
            visible: eq.visible
          })));
        } else {
          setEquations([]);
        }
        
        closeLoadModal();
        // Показываем уведомление об успешной загрузке
        alert(`График "${graph.name}" успешно загружен!`);
      }
    } catch (err: any) {
      console.error('Error loading graph:', err);
      setError(`Ошибка загрузки графика: ${err.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>Desmos3D</h1>
        </div>
        <div className="navbar-menu">
          {isLoggedIn && (
            <>
              <button className="save-btn" onClick={openSaveModal}>Сохранить график</button>
              <button className="load-btn" onClick={openLoadModal}>Загрузить график</button>
            </>
          )}
        </div>
        <div className="navbar-auth">
          {isLoggedIn ? (
            <div className="user-menu">
              <span className="username">Привет, {username}!</span>
              <button className="logout-btn" onClick={handleLogout}>Выйти</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="login-btn" onClick={() => openAuthModal('login')}>Войти</button>
              <button className="register-btn" onClick={() => openAuthModal('register')}>Регистрация</button>
            </div>
          )}
        </div>
      </nav>
      
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={closeAuthModal}>
          <div className="auth-modal" onClick={e => e.stopPropagation()}>
            <div className="auth-modal-header">
              <h2>{authMode === 'login' ? 'Вход' : 'Регистрация'}</h2>
              <button className="close-btn" onClick={closeAuthModal}>&times;</button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            {authMode === 'login' ? (
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="username">Имя пользователя</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={loginData.username}
                    onChange={handleLoginChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Пароль</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-btn">Войти</button>
                  <button type="button" className="switch-btn" onClick={() => setAuthMode('register')}>
                    Нет аккаунта? Регистрация
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label htmlFor="reg-username">Имя пользователя</label>
                  <input
                    type="text"
                    id="reg-username"
                    name="username"
                    value={registerData.username}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-password">Пароль</label>
                  <input
                    type="password"
                    id="reg-password"
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Подтвердите пароль</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-btn">Регистрация</button>
                  <button type="button" className="switch-btn" onClick={() => setAuthMode('login')}>
                    Уже есть аккаунт? Вход
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      
      {/* Save Graph Modal */}
      {showSaveModal && (
        <div className="auth-modal-overlay" onClick={closeSaveModal}>
          <div className="auth-modal" onClick={e => e.stopPropagation()}>
            <div className="auth-modal-header">
              <h2>Сохранить график</h2>
              <button className="close-btn" onClick={closeSaveModal}>&times;</button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSaveGraph}>
              <div className="form-group">
                <label htmlFor="graph-name">Название графика</label>
                <input
                  type="text"
                  id="graph-name"
                  name="name"
                  value={saveGraphData.name}
                  onChange={handleSaveGraphChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Описание (необязательно)</label>
                <textarea
                  id="description"
                  name="description"
                  value={saveGraphData.description}
                  onChange={handleSaveGraphChange}
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Load Graph Modal */}
      {showLoadModal && (
        <div className="auth-modal-overlay" onClick={closeLoadModal}>
          <div className="auth-modal graph-list-modal" onClick={e => e.stopPropagation()}>
            <div className="auth-modal-header">
              <h2>Мои сохраненные графики</h2>
              <button className="close-btn" onClick={closeLoadModal}>&times;</button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            {loading ? (
              <div className="loading">Загрузка...</div>
            ) : savedGraphs.length > 0 ? (
              <div className="graph-list">
                {savedGraphs.map(graph => (
                  <div key={graph.id} className="graph-item" onClick={() => handleLoadGraph(graph.id)}>
                    <h3>{graph.name}</h3>
                    {graph.description && <p>{graph.description}</p>}
                    <p className="graph-date">Создан: {new Date(graph.created_at!).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-graphs">У вас еще нет сохраненных графиков</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar; 