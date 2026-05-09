import React, { useState } from "react";
import {
  MenuBook,
  Assignment,
  Feedback,
  Create,
  TrendingUp,
  BarChart,
  Check,
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
      label: "Запишитесь на курс",
      description:
        "Присоединяйтесь к учебным курсам и получайте доступ к материалам.",
    },
    {
      icon: <Assignment />,
      label: "Сдавайте задания",
      description:
        "Загружайте решения, работайте в команде и следите за дедлайнами.",
    },
    {
      icon: <Feedback />,
      label: "Получайте обратную связь",
      description: "Оценки и комментарии преподавателей — всё в одном месте.",
    },
    {
      icon: <BarChart />,
      label: "Смотрите прогресс",
      description: "Отслеживайте свою успеваемость по каждому курсу.",
    },
  ];

  const lecturerSteps = [
    {
      icon: <Create />,
      label: "Создайте курс",
      description:
        "Добавьте материалы, задания, настройте дедлайны и балльную систему.",
    },
    {
      icon: <TrendingUp />,
      label: "Управляйте процессом",
      description:
        "Приглашайте студентов и экспертов, закрепляйте задачи, контролируйте сроки.",
    },
    {
      icon: <Check />,
      label: "Проверяйте работы",
      description:
        "Оценивайте решения студентов, отвечайте на вопросы прямо в сервисе.",
    },
    {
      icon: <BarChart />,
      label: "Анализируйте успеваемость",
      description: "Смотрите прогресс студентов, выгружайте ведомости в Excel.",
    },
  ];

  const expertSteps = [
    {
      icon: <Create />,
      label: "Примите приглашение",
      description:
        "Перейдите по ссылке от преподавателя и сразу приступайте к работе.",
    },
    {
      icon: <Check />,
      label: "Проверяйте задания",
      description:
        "Оценивайте работы закреплённых за вами студентов и оставляйте комментарии.",
    },
    {
      icon: <Feedback />,
      label: "Взаимодействуйте со студентами",
      description:
        "Помогайте улучшать решения, не выходя за рамки назначенных задач.",
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
            Веб-сервис, который помогает автоматизировать учебный процесс и
            улучшить взаимодействие между студентами, преподавателями и
            экспертами из индустрии
          </Typography>
        </Container>
      </Box>

      {/* Объединённая секция с фиксированной высотой и прокруткой в левой панели */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        {/* Табы, выровненные по левой колонке */}
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
                  "& .MuiToggleButtonGroup-grouped": {
                    border: "1px solid #e0e0e0",
                    borderRadius: 0,
                    borderBottom: "1px solid #e0e0e0",
                    "&.Mui-selected": {
                      borderBottom: "2px solid #3f51b5",
                    },
                  },
                  "& .MuiToggleButtonGroup-grouped:not(:first-of-type)": {
                    marginLeft: "-1px",
                  },
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

        {/* Основной контейнер с фиксированной высотой */}
        <Box
          sx={{
            borderRadius: "16px",
            border: "1px solid #e0e0e0",
            height: 580,
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            backgroundColor: "#fff",
          }}
        >
          <Grid container sx={{ height: "100%" }}>
            {/* Левая панель (шаги) с прокруткой */}
            <Grid
              item
              xs={12}
              md={5}
              sx={{
                p: 4,
                borderRight: { md: "1px solid #e0e0e0" },
                overflowY: "auto",
              }}
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
                  mt: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                {steps.map((step, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    onClick={() => setActiveStep(index)}
                    sx={{
                      p: 1.5, // уменьшено с 2.5
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
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
                      sx={{ color: "#3f51b5", display: "flex", fontSize: 24 }}
                    >
                      {step.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
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

            {/* Правая панель (скриншот) */}
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
      </Container>
    </Box>
  );
};

export default PromoPage;
