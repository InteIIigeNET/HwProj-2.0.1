import React from "react";
import { Container, Typography, Button } from "@mui/material";

const PromoPage: React.FC = () => {
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
    </Container>
  );
};

export default PromoPage;
