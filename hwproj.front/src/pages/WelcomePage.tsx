import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MenuBook,
  Feedback,
  Create,
  TrendingUp,
  BarChart,
  Check,
  Notifications,
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

const WelcomePage: React.FC = () => {
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

  const studentSteps = [
    {
      icon: <MenuBook />,
      label: "Запишитесь на курс",
      description:
        "Присоединяйтесь к учебным курсам и получайте доступ к материалам.",
    },
    {
      icon: <Notifications />,
      label: "Следите за дедлайнами",
      description: "Контролируйте сроки сдачи по всем курсам.",
    },
    {
      icon: <Feedback />,
      label: "Сдавайте задания и получайте обратную связь",
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
      description: "Смотрите прогресс студентов.",
    },
  ];

  const expertSteps = [
    {
      icon: <Create />,
      label: "Получите приглашение от преподавателя",
      description:
        "Перейдите по ссылке от преподавателя и сразу приступайте к работе.",
    },
    {
      icon: <Feedback />,
      label: "Взаимодействуйте со студентами",
      description:
        "Оценивайте работы закреплённых за Вами студентов и оставляйте комментарии.",
    },
  ];

  const steps =
    userType === "student"
      ? studentSteps
      : userType === "lecturer"
      ? lecturerSteps
      : expertSteps;

  const userTypes = [
    { value: "student", label: "Студентам" },
    { value: "lecturer", label: "Преподавателям" },
    { value: "expert", label: "Экспертам" },
  ] as const;

  return (
    <Box sx={{ overflowX: "hidden" }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: "#e3f2fd",
          py: { xs: 3, md: 4 },
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
              fontSize: { xs: "1.75rem", sm: "2.25rem", md: "3.5rem" },
              color: "#3f51b5",
            }}
          >
            Привет! Это HwProj ✌️
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            paragraph
            sx={{ fontSize: { xs: "0.95rem", sm: "1.1rem", md: "1.5rem" } }}
          >
            Веб-сервис, который помогает автоматизировать учебный процесс и
            упростить взаимодействие между студентами, преподавателями и
            экспертами из индустрии
          </Typography>
        </Container>
      </Box>

      {/* Объединённая секция: на десктопе — фиксированная высота с прокруткой
          в левой панели, на мобильных — колонка с автовысотой */}
      <Container
        maxWidth="xl"
        sx={{
          mt: { xs: 3, md: 6 },
          mb: { xs: 4, md: 8 },
          px: { xs: 1.5, sm: 2, md: 3 },
        }}
      >
        {/* Табы, выровненные по левой колонке */}
        <Grid container>
          <Grid item xs={12} md={5}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <ToggleButtonGroup
                value={userType}
                exclusive
                onChange={handleUserType}
                sx={{
                  maxWidth: "100%",
                  width: { xs: "100%", sm: "auto" },
                  "& .MuiToggleButtonGroup-grouped": {
                    flex: { xs: 1, sm: "none" },
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
                {userTypes.map(({ value, label }) => (
                  <ToggleButton
                    key={value}
                    value={value}
                    sx={{
                      fontSize: { xs: "0.75rem", sm: "0.95rem", md: "1.1rem" },
                      px: { xs: 0.5, sm: 1.5, md: 2 },
                      py: { xs: 1, md: 1.5 },
                      lineHeight: 1.2,
                      textTransform: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Grid>
        </Grid>

        {/* Основной контейнер: фиксированная высота только на десктопе */}
        <Box
          sx={{
            borderRadius: "16px",
            border: "1px solid #e0e0e0",
            height: { xs: "auto", md: 580 },
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            backgroundColor: "#fff",
          }}
        >
          <Grid container sx={{ height: "100%" }}>
            {/* Левая панель: заголовок, список шагов и кнопка регистрации внизу */}
            <Grid
              item
              xs={12}
              md={5}
              sx={{
                p: { xs: 2, md: 4 },
                borderRight: { md: "1px solid #e0e0e0" },
                borderBottom: { xs: "1px solid #e0e0e0", md: "none" },
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              <Typography
                variant="h5"
                align="center"
                gutterBottom
                sx={{
                  fontWeight: 500,
                  fontSize: { xs: "1.25rem", md: "1.5rem" },
                }}
              >
                Как это работает
              </Typography>

              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  flexGrow: 1,
                  minHeight: 0,
                  overflowY: { xs: "visible", md: "auto" },
                }}
              >
                {steps.map((step, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    onClick={() => setActiveStep(index)}
                    sx={{
                      p: 1.2,
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
                      sx={{
                        color: "#3f51b5",
                        display: "flex",
                        fontSize: 24,
                        flexShrink: 0,
                      }}
                    >
                      {step.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: "0.95rem", md: "1rem" },
                          lineHeight: 1.3,
                        }}
                      >
                        {step.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}
                      >
                        {step.description}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>

              {/* Кнопка регистрации, прижатая к низу колонки */}
              <Button
                variant="contained"
                component={Link}
                to="/register"
                fullWidth
                sx={{
                  flexShrink: 0,
                  mt: 3,
                  bgcolor: "#3f51b5",
                  color: "white",
                  py: 1.25,
                  fontSize: { xs: "0.95rem", md: "1rem" },
                  textTransform: "none",
                  borderRadius: "8px",
                  "&:hover": { bgcolor: "#3f51b5", color: "white" },
                }}
              >
                Присоединиться
              </Button>
            </Grid>

            {/* Правая панель (скриншот) */}
            <Grid
              item
              xs={12}
              md={7}
              sx={{
                backgroundColor: "#fafafa",
                p: { xs: 2, md: 3 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 0,
              }}
            >
              <Box
                component="img"
                src={`/screenshots/${userType}-step${activeStep + 1}.png`}
                alt={steps[activeStep].label}
                sx={{
                  maxWidth: "100%",
                  maxHeight: { xs: "50vh", md: "100%" },
                  objectFit: "contain",
                  borderRadius: "12px",
                  boxShadow: 2,
                  backgroundColor: "#fafafa",
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default WelcomePage;
