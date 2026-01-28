import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Typography
} from '@mui/material';
import type { PullJob } from '../../types/engine.types';

interface JobsListTableProps {
    jobs: PullJob[];
}

export default function JobsListTable({ jobs }: JobsListTableProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS': return 'success';
            case 'FAILED': return 'error';
            case 'IN_PROGRESS': return 'primary';
            case 'PENDING': return 'warning';
            default: return 'default';
        }
    };

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Job ID</TableCell>
                        <TableCell>Target Type</TableCell>
                        <TableCell>Target ID</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Created At</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {jobs.map((job) => (
                        <TableRow
                            key={job.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                #{job.id}
                            </TableCell>
                            <TableCell>{job.targetType}</TableCell>
                            <TableCell>{job.targetId}</TableCell>
                            <TableCell>
                                <Chip
                                    label={job.status}
                                    color={getStatusColor(job.status) as any}
                                    size="small"
                                    variant="outlined"
                                />
                            </TableCell>
                            <TableCell>{new Date(job.createdAt).toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                    {jobs.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                <Typography color="textSecondary">No recent jobs found.</Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
