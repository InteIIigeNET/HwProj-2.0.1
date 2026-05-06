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
  const [userType, setUserType] = useState<"student" | "lecturer">("student");

  const handleUserType = (
    event: React.MouseEvent<HTMLElement>,
    newUserType: "student" | "lecturer" | null,
  ) => {
    if (newUserType !== null) {
      setUserType(newUserType);
    }
  };

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
            Удобное место для учёбы и преподавания.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: "#3f51b5",
              color: "white",
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
              textTransform: "none",
              borderRadius: "8px",
              "&:hover": {
                bgcolor: "#1565c0",
              },
            }}
          >
            Начать знакомство
          </Button>
        </Container>
      </Box>

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
          Это платформа для учёбы и преподавания. Мы создали её, чтобы студентам
          было проще сдавать задания и следить за своим прогрессом, а
          преподавателям — проверять работы и видеть успехи группы.
        </Typography>
        <Typography
          variant="body1"
          sx={{ textAlign: "center", maxWidth: "700px", mx: "auto" }}
        >
          Наш проект это простой и удобный инструмент, который помогает учиться
          и учить.
        </Typography>
      </Container>

      {/* Объединённая секция: Аудитория + Как это работает */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <ToggleButtonGroup
            value={userType}
            exclusive
            onChange={handleUserType}
            sx={{
              "& .MuiToggleButton-root": {
                px: 4,
                py: 1.5,
                textTransform: "none",
                fontSize: "1rem",
                borderRadius: "8px",
              },
              "& .Mui-selected": {
                bgcolor: "#3f51b5 !important",
                color: "white !important",
              },
            }}
          >
            <ToggleButton value="student">Студентам</ToggleButton>
            <ToggleButton value="lecturer">Преподавателям</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Grid container spacing={3} justifyContent="center">
          {userType === "student" ? (
            <>
              <Grid item xs={12} sm={4}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    borderRadius: "16px",
                    height: "100%",
                  }}
                >
                  <MenuBook sx={{ fontSize: 48, color: "#3f51b5", mb: 2 }} />
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Выберите курс
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Найдите подходящий курс из каталога и присоединяйтесь.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    borderRadius: "16px",
                    height: "100%",
                  }}
                >
                  <Assignment sx={{ fontSize: 48, color: "#3f51b5", mb: 2 }} />
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Выполняйте задания
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Решайте задачи, загружайте решения и следите за дедлайнами.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    borderRadius: "16px",
                    height: "100%",
                  }}
                >
                  <Feedback sx={{ fontSize: 48, color: "#3f51b5", mb: 2 }} />
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Получайте обратную связь
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Узнавайте результаты проверки и улучшайте свои навыки.
                  </Typography>
                </Paper>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} sm={4}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    borderRadius: "16px",
                    height: "100%",
                  }}
                >
                  <Create sx={{ fontSize: 48, color: "#3f51b5", mb: 2 }} />
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Создайте курс
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Добавьте материалы, настройте задания и пригласите
                    студентов.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    borderRadius: "16px",
                    height: "100%",
                  }}
                >
                  <TrendingUp sx={{ fontSize: 48, color: "#3f51b5", mb: 2 }} />
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Отслеживайте прогресс
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Смотрите, как студенты справляются с заданиями и растут.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    borderRadius: "16px",
                    height: "100%",
                  }}
                >
                  <BarChart sx={{ fontSize: 48, color: "#3f51b5", mb: 2 }} />
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Анализируйте успеваемость
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Используйте статистику для улучшения учебного процесса.
                  </Typography>
                </Paper>
              </Grid>
            </>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default PromoPage;
