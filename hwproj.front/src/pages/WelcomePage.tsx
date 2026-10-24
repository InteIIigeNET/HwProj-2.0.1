import React, { ReactElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MenuBook,
  Feedback,
  Create,
  TrendingUp,
  BarChart,
  Check,
  Notifications,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import {
  Box,
  ButtonBase,
  Chip,
  Container,
  Typography,
  Button,
  IconButton,
  Paper,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";

// Фирменное индиго; то же значение закреплено как palette.primary.main в src/index.tsx
const BRAND = "#3f51b5";

const heroSx = {
  background: "linear-gradient(135deg, #f4f5fc 0%, #e8ebfa 55%, #dde2f7 100%)",
  borderBottom: "1px solid #dfe3f2",
  py: { xs: 2.5, md: 3.5 },
};

const heroTitleSx = {
  fontWeight: 700,
  fontSize: { xs: "1.75rem", sm: "2.25rem", md: "3.25rem" },
  lineHeight: 1.15,
  color: BRAND,
};

const heroSubtitleSx = {
  mt: 1.25,
  color: "text.secondary",
  fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.25rem" },
  lineHeight: 1.5,
};

const primaryButtonSx = {
  px: 3,
  py: 1.25,
  borderRadius: "10px",
  textTransform: "none",
  fontSize: "1rem",
  fontWeight: 500,
  boxShadow: "none",
  "&:hover": { boxShadow: "none" },
};

const secondaryButtonSx = {
  px: 3,
  py: 1.25,
  borderRadius: "10px",
  textTransform: "none",
  fontSize: "1rem",
  fontWeight: 500,
  borderColor: "#c3cbef",
  backgroundColor: "rgba(255, 255, 255, 0.7)",
  "&:hover": { borderColor: BRAND, backgroundColor: "#fff" },
};

const heroChipSx = {
  height: 30,
  borderRadius: "999px",
  border: "1px solid #d5dbf1",
  backgroundColor: "rgba(255, 255, 255, 0.75)",
  color: "#3c4258",
  "& .MuiChip-icon": { fontSize: 17, ml: 1.25, mr: -0.25, color: BRAND },
  "& .MuiChip-label": { px: 1.25, fontSize: "0.8125rem", fontWeight: 500 },
};

// Оформление панели согласовано с редизайном курсов и профиля: та же рамка и радиусы
const panelSx = {
  borderRadius: "16px",
  borderColor: "#c4cad2",
  overflow: "hidden",
  backgroundColor: "#fff",
};

// Сегментированный переключатель роли: MUI задаёт крайним кнопкам нулевые радиусы
// селектором с :not(), который специфичнее sx, поэтому пилюлю приходится помечать important
const roleToggleSx = {
  p: 0.5,
  borderRadius: "999px",
  backgroundColor: "#eef0f8",
  border: "1px solid #dfe3f2",
  maxWidth: "100%",
  width: { xs: "100%", sm: "auto" },
  "& .MuiToggleButtonGroup-grouped": {
    flex: { xs: 1, sm: "none" },
    border: 0,
    borderRadius: "999px !important",
    px: { xs: 1, sm: 2.5 },
    py: 0.875,
    textTransform: "none",
    fontSize: { xs: "0.8125rem", sm: "0.9375rem" },
    fontWeight: 500,
    lineHeight: 1.2,
    color: "#4a5170",
    "&:hover": { backgroundColor: "rgba(63, 81, 181, 0.08)" },
    "&.Mui-selected": {
      backgroundColor: "#fff",
      color: BRAND,
      boxShadow: "0 1px 3px rgba(23, 30, 66, 0.16)",
      "&:hover": { backgroundColor: "#fff" },
    },
  },
};

const stepSx = (isActive: boolean) => ({
  width: "100%",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  textAlign: "left" as const,
  gap: 1.5,
  p: 1.25,
  borderRadius: "12px",
  border: "1px solid",
  borderColor: isActive ? BRAND : "transparent",
  backgroundColor: isActive ? "#f0f2fc" : "transparent",
  transition: "background-color .15s, border-color .15s",
  "&:hover": { backgroundColor: isActive ? "#f0f2fc" : "#f5f6fa" },
});

const stepIconSx = (isActive: boolean) => ({
  width: 36,
  height: 36,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "10px",
  backgroundColor: isActive ? "#dde1f8" : "#eef0f5",
  color: isActive ? BRAND : "#6b7186",
  transition: "background-color .15s, color .15s",
  "& .MuiSvgIcon-root": { fontSize: 20 },
});

// Тонкая полоса прокрутки: системная поверх панели выглядит чужеродно и съедает высоту
const scrollbarSx = {
  "&::-webkit-scrollbar": { width: "8px" },
  "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
  "&::-webkit-scrollbar-thumb": { backgroundColor: "#c4cad2", borderRadius: "4px" },
  "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#a8b0d8" },
};

const navButtonSx = {
  border: "1px solid #d5d9e6",
  borderRadius: "10px",
  color: "#4a5170",
  "&:hover": { borderColor: "#a8b0d8", backgroundColor: "#f0f2fc", color: BRAND },
  "&.Mui-disabled": { borderColor: "#e6e8f0", color: "#c2c6d4" },
};

const stepDotSx = (isActive: boolean) => ({
  width: isActive ? 22 : 8,
  height: 8,
  p: 0,
  minWidth: 0,
  borderRadius: "999px",
  backgroundColor: isActive ? BRAND : "#cfd4e4",
  transition: "width .2s, background-color .2s",
  "&:hover": { backgroundColor: isActive ? BRAND : "#a8b0d8" },
});

interface IStep {
  icon: ReactElement;
  label: string;
  description: string;
}

const studentSteps: IStep[] = [
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

const lecturerSteps: IStep[] = [
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

const expertSteps: IStep[] = [
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

const userTypes = [
  { value: "student", label: "Студентам", steps: studentSteps },
  { value: "lecturer", label: "Преподавателям", steps: lecturerSteps },
  { value: "expert", label: "Экспертам", steps: expertSteps },
] as const;

type UserType = (typeof userTypes)[number]["value"];

const heroFeatures = [
  { icon: <MenuBook />, label: "Курсы и задания" },
  { icon: <Notifications />, label: "Дедлайны и уведомления" },
  { icon: <Feedback />, label: "Оценки и обратная связь" },
  { icon: <BarChart />, label: "Статистика и прогресс" },
];

const WelcomePage: React.FC = () => {
  const [userType, setUserType] = useState<UserType>("student");
  const [activeStep, setActiveStep] = useState(0);

  const steps = userTypes.find((t) => t.value === userType)!.steps;
  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === steps.length - 1;

  const handleUserType = (
    event: React.MouseEvent<HTMLElement>,
    newUserType: UserType | null,
  ) => {
    if (newUserType !== null) {
      setUserType(newUserType);
      setActiveStep(0); // сброс шага при смене роли
    }
  };

  // Шаги — это по сути слайды, поэтому листаем их и стрелками
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight")
        setActiveStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
      if (e.key === "ArrowLeft")
        setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [steps.length]);

  return (
    <Box sx={{ overflowX: "hidden" }}>
      {/* Hero Section */}
      <Box sx={heroSx}>
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography variant="h2" component="h1" sx={heroTitleSx}>
            Привет! Это HwProj ✌️
          </Typography>
          <Typography sx={heroSubtitleSx}>
            Веб-сервис, который помогает автоматизировать учебный процесс и
            упростить взаимодействие между студентами, преподавателями и
            экспертами из индустрии
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            flexWrap="wrap"
            sx={{ mt: { xs: 2, md: 2.5 }, rowGap: 1 }}
          >
            {heroFeatures.map(({ icon, label }) => (
              <Chip key={label} icon={icon} label={label} sx={heroChipSx} />
            ))}
          </Stack>
        </Container>
      </Box>

      <Container
        maxWidth="xl"
        sx={{
          mt: { xs: 2.5, md: 3.5 },
          mb: { xs: 4, md: 8 },
          px: { xs: 1.5, sm: 2, md: 3 },
        }}
      >
        {/* Заголовок раздела и выбор роли: набор шагов зависит от того, кем пришёл пользователь */}
        <Stack alignItems="center" spacing={2} sx={{ mb: { xs: 2.5, md: 3.5 } }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 600,
                fontSize: { xs: "1.35rem", md: "1.75rem" },
              }}
            >
              Как это работает
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 0.5, color: "text.secondary" }}
            >
              Выберите роль — и посмотрите сервис её глазами
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={userType}
            exclusive
            onChange={handleUserType}
            aria-label="Роль пользователя"
            sx={roleToggleSx}
          >
            {userTypes.map(({ value, label }) => (
              <ToggleButton key={value} value={value}>
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>

        {/* Основной контейнер: фиксированная высота только на десктопе */}
        <Paper
          variant="outlined"
          sx={{
            ...panelSx,
            height: { xs: "auto", md: 580 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* Левая панель: список шагов и кнопка регистрации внизу */}
          <Box
            sx={{
              width: { xs: "100%", md: "38%" },
              flexShrink: 0,
              p: { xs: 2, md: 3 },
              borderRight: { md: "1px solid #e3e6ee" },
              borderBottom: { xs: "1px solid #e3e6ee", md: "none" },
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <Stack
              spacing={1}
              sx={{
                flexGrow: 1,
                minHeight: 0,
                overflowY: { xs: "visible", md: "auto" },
                ...scrollbarSx,
              }}
            >
              {steps.map((step, index) => {
                const isActive = activeStep === index;
                return (
                  <ButtonBase
                    key={step.label}
                    onClick={() => setActiveStep(index)}
                    aria-current={isActive ? "step" : undefined}
                    sx={stepSx(isActive)}
                  >
                    <Box sx={stepIconSx(isActive)}>{step.icon}</Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: "0.9375rem", md: "1rem" },
                          lineHeight: 1.3,
                          color: isActive ? BRAND : "text.primary",
                        }}
                      >
                        {step.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.25,
                          color: "text.secondary",
                          fontSize: { xs: "0.8rem", md: "0.875rem" },
                        }}
                      >
                        {step.description}
                      </Typography>
                    </Box>
                  </ButtonBase>
                );
              })}
            </Stack>
          </Box>

          {/* Правая панель: скриншот выбранного шага */}
          <Box
            sx={{
              flexGrow: 1,
              minWidth: 0,
              p: { xs: 2, md: 3 },
              backgroundColor: "#fafbfe",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            {/* Всё свободное место отдано скриншоту: ни рамки-«окна», ни номера шага */}
            <Box
              sx={{
                flexGrow: 1,
                minHeight: { xs: 220, sm: 280, md: 0 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
                  backgroundColor: "#fafbfe",
                }}
              />
            </Box>

            {/* Листалка шагов: клавиатурные стрелки работают на всей странице */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={1.5}
              sx={{ flexShrink: 0 }}
            >
              {/* Без Tooltip: на крайних шагах кнопка disabled, а MUI ругается на такого ребёнка */}
              <IconButton
                size="small"
                aria-label="Предыдущий шаг"
                disabled={isFirstStep}
                onClick={() => setActiveStep(activeStep - 1)}
                sx={navButtonSx}
              >
                <ChevronLeft fontSize="small" />
              </IconButton>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                {steps.map((step, index) => (
                  <ButtonBase
                    key={step.label}
                    aria-label={`Шаг ${index + 1}: ${step.label}`}
                    onClick={() => setActiveStep(index)}
                    sx={stepDotSx(activeStep === index)}
                  />
                ))}
              </Stack>
              <IconButton
                size="small"
                aria-label="Следующий шаг"
                disabled={isLastStep}
                onClick={() => setActiveStep(activeStep + 1)}
                sx={navButtonSx}
              >
                <ChevronRight fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        </Paper>

        {/* Финальный призыв: до кнопки в левой колонке на мобильных нужно долго скроллить */}
        <Paper
          variant="outlined"
          sx={{
            ...panelSx,
            mt: { xs: 3, md: 4 },
            p: { xs: 2.5, md: 4 },
            textAlign: "center",
            background:
              "linear-gradient(135deg, #f4f5fc 0%, #eceffb 60%, #e4e8f8 100%)",
            borderColor: "#dfe3f2",
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            sx={{ fontWeight: 600, fontSize: { xs: "1.15rem", md: "1.35rem" } }}
          >
            Готовы попробовать?
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
            Зарегистрируйтесь, чтобы записаться на курс или создать свой
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="center"
            sx={{ mt: 2.5 }}
          >
            <Button
              variant="contained"
              component={Link}
              to="/register"
              sx={primaryButtonSx}
            >
              Присоединиться
            </Button>
            <Button
              variant="outlined"
              component={Link}
              to="/login"
              sx={secondaryButtonSx}
            >
              Войти
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default WelcomePage;
