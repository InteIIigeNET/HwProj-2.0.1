import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Box,
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
    <Container maxWidth="lg" style={{ marginTop: "2rem" }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Добро пожаловать в HwProj
      </Typography>
      <Typography variant="body1" paragraph>
        Платформа для обучения и управления курсами.
      </Typography>
      <Button variant="contained" color="primary">
        Начать обучение
      </Button>

      {/* Блок с переключателем внутри того же Container */}
      <Box sx={{ mt: 4, mb: 4, textAlign: "center" }}>
        <ToggleButtonGroup
          value={userType}
          exclusive
          onChange={handleUserType}
          aria-label="тип пользователя"
          color="primary"
        >
          <ToggleButton value="student" aria-label="для студентов">
            Студентам
          </ToggleButton>
          <ToggleButton value="lecturer" aria-label="для преподавателей">
            Преподавателям
          </ToggleButton>
        </ToggleButtonGroup>

        <Typography variant="h6" sx={{ mt: 3 }}>
          {userType === "student"
            ? "Учитесь в удобном темпе, сдавайте задания и отслеживайте прогресс"
            : "Создавайте курсы, проверяйте решения и анализируйте успеваемость студентов"}
        </Typography>
      </Box>
    </Container>
  );
};

export default PromoPage;
