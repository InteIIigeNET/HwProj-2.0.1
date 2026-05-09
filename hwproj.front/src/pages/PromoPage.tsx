import React, { useState } from "react";
import {
  MenuBook,
  Assignment,
  Feedback,
  Create,
  TrendingUp,
  BarChart,
} from "@mui/icons-material";
import {
  Box,
  Container,
  Typography,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  Paper,
} from "@mui/material";

const PromoPage: React.FC = () => {
  const [userType, setUserType] = useState<"student" | "lecturer" | "expert">(
    "student",
  );
  const [activeStep, setActiveStep] = useState(0);

  const handleUserType = (
    event: React.MouseEvent<HTMLElement>,
    newUserType: "student" | "lecturer" | "expert" | null,
  ) => {
    if (newUserType !== null) {
      setUserType(newUserType);
      setActiveStep(0); // сброс шага при смене роли
    }
  };

  // Данные для шагов
  const studentSteps = [
    {
      icon: <MenuBook />,
      label: "Выберите курс",
      description: "Найдите подходящий курс из каталога и присоединяйтесь.",
    },
    {
      icon: <Assignment />,
      label: "Выполняйте задания",
      description:
        "Решайте задачи, загружайте решения и следите за дедлайнами.",
    },
    {
      icon: <Feedback />,
      label: "Получайте обратную связь",
      description: "Узнавайте результаты проверки и улучшайте свои навыки.",
    },
  ];

  const lecturerSteps = [
    {
      icon: <Create />,
      label: "Создайте курс",
      description:
        "Добавьте материалы, настройте задания и пригласите студентов.",
    },
    {
      icon: <TrendingUp />,
      label: "Отслеживайте прогресс",
      description: "Смотрите, как студенты справляются с заданиями и растут.",
    },
    {
      icon: <BarChart />,
      label: "Анализируйте успеваемость",
      description: "Используйте статистику для улучшения учебного процесса.",
    },
  ];

  const expertSteps = [
    {
      icon: <BarChart />,
      label: "Получите приглашение",
      description: "123",
    },
    {
      icon: <BarChart />,
      label: "Получите приглашение",
      description: "123",
    },
    {
      icon: <BarChart />,
      label: "Получите приглашение",
      description: "123",
    },
  ];

  const steps =
    userType === "student"
      ? studentSteps
      : userType === "lecturer"
      ? lecturerSteps
      : expertSteps;

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: "#e3f2fd",
          py: { xs: 8, md: 10 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: "2rem", md: "3.5rem" },
              color: "#3f51b5",
            }}
          >
            Привет! Это HwProj ✌️
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            paragraph
            sx={{ mb: 4, fontSize: { xs: "1rem", md: "1.5rem" } }}
          >
            Сервис для учёбы и преподавания, чтобы студентам было проще сдавать
            задания и следить за своим прогрессом, а преподавателям — проверять
            работы и видеть успехи группы.
          </Typography>
        </Container>
      </Box>

      {/* О проекте */}
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: 600, color: "#3f51b5" }}
        >
          Что такое HwProj?
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ mt: 3, textAlign: "center", maxWidth: "700px", mx: "auto" }}
        >
          Это сервис для учёбы и преподавания, чтобы студентам было проще
          сдавать задания и следить за своим прогрессом, а преподавателям —
          проверять работы и видеть успехи группы.
        </Typography>
        <Typography
          variant="body1"
          sx={{ textAlign: "center", maxWidth: "700px", mx: "auto" }}
        >
          Наш проект это простой и удобный инструмент, который помогает учиться
          и учить.
        </Typography>
      </Container>

      {/* Объединённая секция: Аудитория + Как это работает (табы строго над левой панелью) */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        {/* Строка с табами, выровненная по левой колонке */}
        {/*<Box sx={{ mb: 1 }}>*/}
        <Grid container>
          <Grid item xs={12} md={5}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <ToggleButtonGroup
                value={userType}
                exclusive
                onChange={handleUserType}
                sx={{
                  // Даём каждой кнопке рамку
                  "& .MuiToggleButtonGroup-grouped": {
                    border: "1px solid #e0e0e0",
                    borderRadius: 0,
                    // Убираем нижнюю рамку для неактивных (или можно оставить, но тогда активная будет с двойной, если добавим borderBottom)
                    borderBottom: "1px solid #e0e0e0",
                    "&.Mui-selected": {
                      // Активная кнопка получает цветную нижнюю границу вместо обычной
                      borderBottom: "2px solid #3f51b5",
                    },
                  },
                  // Убираем левую границу у всех, кроме первой, чтобы линии не двоились
                  "& .MuiToggleButtonGroup-grouped:not(:first-of-type)": {
                    marginLeft: "-1px", // чтобы границы стыковались вплотную
                  },
                  // Скругляем верхние углы крайним кнопкам
                  "& .MuiToggleButtonGroup-grouped:first-of-type": {
                    borderTopLeftRadius: 8,
                  },
                  "& .MuiToggleButtonGroup-grouped:last-of-type": {
                    borderTopRightRadius: 8,
                  },
                }}
              >
                <ToggleButton value="student">Студентам</ToggleButton>
                <ToggleButton value="lecturer">Преподавателям</ToggleButton>
                <ToggleButton value="expert">Экспертам</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Grid>
        </Grid>
        {/*</Box>*/}

        {/* Основной блок с левой и правой частью */}
        <Box
          sx={{
            borderRadius: "16px",
            border: "1px solid #e0e0e0",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              overflow: "hidden",
              minHeight: "520px",
            }}
          >
            <Grid container sx={{ height: "100%" }}>
              {/* Левая панель (шаги) */}
              <Grid
                item
                xs={12}
                md={5}
                sx={{ p: 4, borderRight: { md: "1px solid #e0e0e0" } }}
              >
                <Typography
                  variant="h5"
                  align="center"
                  gutterBottom
                  sx={{ fontWeight: 600, mt: 2 }}
                >
                  Как это работает
                </Typography>

                <Box
                  sx={{
                    mt: 3,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  {steps.map((step, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      onClick={() => setActiveStep(index)}
                      sx={{
                        p: 2.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        cursor: "pointer",
                        borderRadius: "12px",
                        backgroundColor:
                          activeStep === index ? "#e3f2fd" : "transparent",
                        border:
                          activeStep === index
                            ? "2px solid #3f51b5"
                            : "2px solid transparent",
                        transition: "all 0.2s",
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          color: "#3f51b5",
                          display: "flex",
                          fontSize: 32,
                        }}
                      >
                        {step.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          {step.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {step.description}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Grid>

              {/* Правая панель (место для скриншота) */}
              <Grid
                item
                xs={12}
                md={7}
                sx={{
                  backgroundColor: "#fafafa",
                  p: { xs: 3, md: 4 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    minHeight: 400,
                    backgroundColor: "#e0e0e0",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    p: 3,
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    {steps[activeStep].label}
                    <br />
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      (скриншот интерфейса)
                    </Typography>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default PromoPage;
