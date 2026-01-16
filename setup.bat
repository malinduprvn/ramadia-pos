@echo off
echo Starting RAMADIA Restaurant POS System...

echo Installing root dependencies...
npm install

echo Installing backend dependencies...
cd backend
npm install
cd ..

echo Installing frontend dependencies...
cd frontend
npm install
cd ..

echo Setup complete!
echo.
echo To start the development server, run:
echo npm run dev
echo.
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:3000
pause