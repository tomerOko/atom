import React from 'react';
import styled from 'styled-components';
import {
  Button,
  Card,
  Container,
  Grid,
  GridItem,
  Hero,
  HeroContent,
  HeroTitle,
  HeroSubtitle,
  HeroActions,
  Section,
  Heading2,
  Heading3,
  Text,
} from '../shared/components/generic';
import { Layout } from '../shared/components/layout/layout';
import { theme } from '../shared/styles/theme';

const FeatureCard = styled(Card)`
  text-align: center;
  padding: ${theme.spacing.xl};
  transition: transform ${theme.transitions.base};

  &:hover {
    transform: translateY(-4px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${theme.spacing.lg};
`;

export const Home: React.FC = () => {
  const features = [
    {
      icon: '🚀',
      title: 'מהיר ויעיל',
      description: 'פיתוח מהיר עם כלים מתקדמים',
    },
    {
      icon: '🎨',
      title: 'עיצוב מודרני',
      description: 'ממשק משתמש אטרקטיבי וידידותי',
    },
    {
      icon: '📱',
      title: 'רספונסיבי',
      description: 'מותאם לכל המכשירים והמסכים',
    },
    {
      icon: '🔧',
      title: 'ניתן להתאמה',
      description: 'קל להתאמה אישית והרחבה',
    },
    {
      icon: '🛡️',
      title: 'בטוח ואמין',
      description: 'נבנה עם שיטות עבודה מתקדמות',
    },
    {
      icon: '⚡',
      title: 'ביצועים גבוהים',
      description: 'מותאם לביצועים מיטביים',
    },
  ];

  return (
    <Layout>
      <Hero
        fullHeight
        centered
        background="gradient"
        backgroundImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        overlay
      >
        <Container>
          <HeroContent>
            <HeroTitle>ברוכים הבאים לתבנית הפרויקט</HeroTitle>
            <HeroSubtitle>תבנית מתקדמת לפיתוח אפליקציות ווב מודרניות</HeroSubtitle>
            <HeroActions centered>
              <Button variant="primary" size="large">
                התחל עכשיו
              </Button>
              <Button variant="outline" size="large">
                קרא עוד
              </Button>
            </HeroActions>
          </HeroContent>
        </Container>
      </Hero>

      <Section>
        <Container>
          <Heading2 align="center" style={{ marginBottom: theme.spacing.xl }}>
            מה כלול בתבנית?
          </Heading2>

          <Grid columns={3} gap="lg">
            {features.map((feature, index) => (
              <GridItem key={index}>
                <FeatureCard variant="elevated">
                  <FeatureIcon>{feature.icon}</FeatureIcon>
                  <Heading3 style={{ marginBottom: theme.spacing.md }}>{feature.title}</Heading3>
                  <Text color="gray">{feature.description}</Text>
                </FeatureCard>
              </GridItem>
            ))}
          </Grid>
        </Container>
      </Section>

      <Section style={{ backgroundColor: theme.colors.white }}>
        <Container>
          <Grid columns={2} gap="xl">
            <GridItem>
              <Heading2 style={{ marginBottom: theme.spacing.lg }}>תבנית מוכנה לשימוש</Heading2>
              <Text style={{ marginBottom: theme.spacing.md }}>
                התבנית כוללת את כל הכלים הנדרשים לפיתוח אפליקציה מודרנית: React, TypeScript, Styled
                Components, ראוטר, ועוד.
              </Text>
              <Text style={{ marginBottom: theme.spacing.lg }}>
                כל הקומפוננטים הבסיסיים מוכנים ומעוצבים, כך שתוכלו להתחיל לפתח מיד.
              </Text>
              <Button variant="primary">התחילו לפתח</Button>
            </GridItem>

            <GridItem>
              <Card variant="outlined" style={{ padding: theme.spacing.xl }}>
                <Heading3 style={{ marginBottom: theme.spacing.lg }}>טכנולוגיות כלולות</Heading3>
                <Text style={{ marginBottom: theme.spacing.sm }}>⚛️ React 19 עם TypeScript</Text>
                <Text style={{ marginBottom: theme.spacing.sm }}>🎨 Styled Components</Text>
                <Text style={{ marginBottom: theme.spacing.sm }}>🛣️ React Router Dom</Text>
                <Text style={{ marginBottom: theme.spacing.sm }}>🏪 Zustand למצב גלובלי</Text>
                <Text style={{ marginBottom: theme.spacing.sm }}>⚡ Vite לבנייה מהירה</Text>
                <Text>📏 ESLint ו-Prettier</Text>
              </Card>
            </GridItem>
          </Grid>
        </Container>
      </Section>
    </Layout>
  );
};
