# Desmos3D

Desmos3D - это веб-приложение для построения и визуализации 3D графиков математических функций. Проект состоит из двух частей: фронтенд на React и бэкенд на Django.

## Особенности

- Построение 3D графиков математических функций
- Сохранение и загрузка графиков
- Аутентификация пользователей
- Настройка параметров отображения графика
- Интерактивное управление графиками

## Технологии

### Фронтенд
- React
- TypeScript
- CSS3
- Axios для HTTP-запросов

### Бэкенд
- Django
- Django REST Framework
- SQLite
- Token Authentication

## Установка и запуск

### Бэкенд
```bash
cd desmos3d_back
python -m venv venv
source venv/bin/activate  # для Linux/Mac
venv\Scripts\activate     # для Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Фронтенд
```bash
cd desmos3d_front
npm install
npm start
```

## Использование

1. Зарегистрируйтесь или войдите в систему
2. Используйте панель управления для добавления уравнений
3. Настройте параметры отображения графика
4. Сохраните график для последующего использования

## Лицензия

MIT
