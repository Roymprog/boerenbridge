import React from 'react';
import {
  Box,
  Skeleton,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

// Generic skeleton loader
interface SkeletonLoaderProps {
  variant?: 'text' | 'rectangular' | 'rounded' | 'circular';
  width?: number | string;
  height?: number | string;
  lines?: number;
  sx?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  sx,
}) => {
  if (lines > 1) {
    return (
      <Box sx={sx}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            variant={variant}
            width={width}
            height={height}
            sx={{ mb: index < lines - 1 ? 1 : 0 }}
          />
        ))}
      </Box>
    );
  }

  return (
    <Skeleton
      variant={variant}
      width={width}
      height={height}
      sx={sx}
    />
  );
};

// Card skeleton loader
interface CardSkeletonProps {
  rows?: number;
  showActions?: boolean;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  rows = 3,
  showActions = false,
}) => {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
        
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            width={`${Math.random() * 40 + 60}%`}
            height={24}
            sx={{ mb: 1 }}
          />
        ))}
        
        {showActions && (
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Skeleton variant="rectangular" width={80} height={36} />
            <Skeleton variant="rectangular" width={80} height={36} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Table skeleton loader
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 3,
  showHeader = true,
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        {showHeader && (
          <TableHead>
            <TableRow>
              {Array.from({ length: columns }).map((_, index) => (
                <TableCell key={index}>
                  <Skeleton variant="text" width="80%" />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, columnIndex) => (
                <TableCell key={columnIndex}>
                  <Skeleton
                    variant="text"
                    width={`${Math.random() * 30 + 50}%`}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Game history skeleton loader
export const GameHistorySkeleton: React.FC = () => {
  return (
    <Box>
      {/* Filters skeleton */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Skeleton variant="text" width={120} height={24} />
            <Skeleton variant="rectangular" width={24} height={24} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Skeleton variant="rectangular" width={200} height={56} />
            <Skeleton variant="rectangular" width={150} height={56} />
            <Skeleton variant="rectangular" width={150} height={56} />
            <Skeleton variant="rectangular" width={120} height={56} />
          </Box>
        </CardContent>
      </Card>

      {/* Table skeleton */}
      <TableSkeleton rows={8} columns={6} />
      
      {/* Pagination skeleton */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Skeleton variant="rectangular" width={300} height={40} />
      </Box>
    </Box>
  );
};

// Scoreboard skeleton loader
export const ScoreboardSkeleton: React.FC = () => {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Skeleton variant="text" width={200} height={32} />
      </Box>
      
      {/* Scoreboard table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Skeleton variant="text" width="100%" />
              </TableCell>
              {Array.from({ length: 4 }).map((_, index) => (
                <TableCell key={index} align="center">
                  <Skeleton variant="text" width="80%" />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 8 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell>
                  <Skeleton variant="text" width="120px" />
                </TableCell>
                {Array.from({ length: 4 }).map((_, columnIndex) => (
                  <TableCell key={columnIndex} align="center">
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Skeleton variant="text" width="40px" />
                      <Skeleton variant="text" width="40px" />
                      <Skeleton variant="text" width="40px" />
                      <Skeleton variant="text" width="50px" />
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// Game setup skeleton loader
export const GameSetupSkeleton: React.FC = () => {
  return (
    <Box>
      {/* Stepper skeleton */}
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="rectangular" width="100%" height={80} />
      </Box>
      
      {/* Content skeleton */}
      <Card>
        <CardContent>
          <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2 }} />
          <SkeletonLoader variant="text" lines={3} />
        </CardContent>
      </Card>
      
      {/* Actions skeleton */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Skeleton variant="rectangular" width={100} height={40} />
        <Skeleton variant="rectangular" width={120} height={40} />
      </Box>
    </Box>
  );
};
