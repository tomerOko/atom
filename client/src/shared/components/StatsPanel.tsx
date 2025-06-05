import React from 'react';
import styled from 'styled-components';
import type { Stats } from '../types/helmet-detection';

interface StatsPanelProps {
  stats: Stats;
  loading: boolean;
}

const Panel = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  font-size: 1.25rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.span`
  color: #4a5568;
  font-size: 0.875rem;
`;

const StatValue = styled.span`
  color: #2d3748;
  font-weight: 600;
  font-size: 1rem;
`;

const ComplianceRate = styled.div<{ rate: number }>`
  background: ${props =>
    props.rate >= 0.8 ? '#c6f6d5' : props.rate >= 0.5 ? '#fef5e7' : '#fed7d7'};
  color: ${props => (props.rate >= 0.8 ? '#22543d' : props.rate >= 0.5 ? '#c05621' : '#c53030')};
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin-top: 1rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: #718096;
`;

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <Panel>
        <Title>📊 Statistics</Title>
        <LoadingSpinner>Loading stats...</LoadingSpinner>
      </Panel>
    );
  }

  const compliancePercentage = Math.round(stats.complianceRate * 100);

  return (
    <Panel>
      <Title>📊 Statistics</Title>

      <StatItem>
        <StatLabel>Total Images</StatLabel>
        <StatValue>{stats.total}</StatValue>
      </StatItem>

      <StatItem>
        <StatLabel>Pending</StatLabel>
        <StatValue>{stats.pending}</StatValue>
      </StatItem>

      <StatItem>
        <StatLabel>Processing</StatLabel>
        <StatValue>{stats.processing}</StatValue>
      </StatItem>

      <StatItem>
        <StatLabel>Completed</StatLabel>
        <StatValue>{stats.completed}</StatValue>
      </StatItem>

      <StatItem>
        <StatLabel>Failed</StatLabel>
        <StatValue>{stats.failed}</StatValue>
      </StatItem>

      <StatItem>
        <StatLabel>Total People</StatLabel>
        <StatValue>{stats.totalPeople}</StatValue>
      </StatItem>

      <StatItem>
        <StatLabel>With Helmets</StatLabel>
        <StatValue>{stats.totalCompliant}</StatValue>
      </StatItem>

      <ComplianceRate rate={stats.complianceRate}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          {compliancePercentage}%
        </div>
        <div style={{ fontSize: '0.875rem' }}>Helmet Compliance Rate</div>
      </ComplianceRate>
    </Panel>
  );
};
