'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
    X,
    AlertCircle,
    Star,
    MessageSquare,
    Info,
    AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import getAllComplaints from 'app/actions/allComplaints';
import { updateComplaintStatus } from 'app/actions/updateComplaintStatus';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ComplaintStatus = 'to-do' | 'in-progress' | 'resolved';
type ComplaintSeverity = 'low' | 'medium' | 'high';

interface Complaint {
    uuid: string;
    PNR: string;
    status: ComplaintStatus;
    originalQuery: string;
    department: string;
    subtype: string;
    oneLineAI: string;
    severity: ComplaintSeverity;
    created_at: Date;
    updated_at: Date;
    feedback?: string | null;
    stars?: number | null;
    image: string;
}

interface TicketDetailsPopupProps {
    ticket: Complaint;
    onClose: () => void;
}

const TicketDetailsPopup: React.FC<TicketDetailsPopupProps> = ({
    ticket,
    onClose
}) => {
    const stopPropagation = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const getStatusColor = (status: ComplaintStatus): string => {
        switch (status) {
            case 'to-do':
                return 'bg-yellow-500';
            case 'in-progress':
                return 'bg-blue-500';
            case 'resolved':
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getSeverityIcon = (severity: ComplaintSeverity) => {
        switch (severity) {
            case 'high':
                return <AlertTriangle className="text-red-600" />;
            case 'medium':
                return <AlertCircle className="text-yellow-500" />;
            case 'low':
                return <Info className="text-green-500" />;
        }
    };

    return (
        <>
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed inset-0 flex items-center justify-center z-50"
                onClick={onClose}
            >
                <Card
                    className="w-[95vw] max-w-3xl max-h-[95vh] shadow-2xl bg-gradient-to-br from-white to-gray-50"
                    onClick={stopPropagation}
                >
                    <CardHeader className="relative pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-3xl font-bold text-gray-800">
                                Ticket Details
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full hover:bg-red-100 hover:text-red-500 transition-colors"
                                onClick={onClose}
                            >
                                <X className="h-6 w-6" />
                            </Button>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                            <Badge
                                className={`${getStatusColor(ticket.status)} text-white px-3 py-1 rounded-full text-sm font-medium`}
                            >
                                {ticket.status}
                            </Badge>
                            <Badge
                                variant="outline"
                                className="px-3 py-1 rounded-full text-sm font-medium"
                            >
                                PNR: {ticket.PNR}
                            </Badge>
                        </div>
                    </CardHeader>
                    <Separator className="my-2" />
                    <ScrollArea className="h-[calc(95vh-180px)]">
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        Query
                                    </h3>
                                    <p className="text-gray-600 bg-gray-100 p-3 rounded-lg">
                                        {ticket.originalQuery}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        AI Summary
                                    </h3>
                                    <p className="text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                                        {ticket.oneLineAI}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <h3 className="text-lg font-semibold text-gray-700">
                                        Severity
                                    </h3>
                                    <div className="flex items-center space-x-1">
                                        {getSeverityIcon(ticket.severity)}
                                        <span className="text-gray-600">{ticket.severity}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        Details
                                    </h3>
                                    <div className="bg-gray-100 p-4 rounded-lg space-y-2">
                                        <p>
                                            <span className="font-medium">Department:</span>{' '}
                                            {ticket.department}
                                        </p>
                                        <p>
                                            <span className="font-medium">Subtype:</span>{' '}
                                            {ticket.subtype}
                                        </p>
                                        <p>
                                            <span className="font-medium">Created:</span>{' '}
                                            {new Date(ticket.created_at).toLocaleString()}
                                        </p>
                                        <p>
                                            <span className="font-medium">Updated:</span>{' '}
                                            {new Date(ticket.updated_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                {ticket.feedback && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                                            <MessageSquare className="mr-2" /> Feedback
                                        </h3>
                                        <p className="text-gray-600 bg-green-50 p-3 rounded-lg border border-green-200">
                                            {ticket.feedback}
                                        </p>
                                    </div>
                                )}
                                {ticket.stars && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                                            <Star className="mr-2" /> Rating
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <Progress
                                                value={(ticket.stars / 5) * 100}
                                                className="w-full"
                                            />
                                            <span className="text-yellow-500 font-bold">
                                                {ticket.stars}/5
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        {ticket.image && <img src={`data:image/jpeg;base64,${ticket.image}`} alt='image of the complaint' />}
                    </ScrollArea>
                </Card>
            </motion.div>
        </>
    );
};

interface ComplaintCardProps {
    complaint: Complaint;
    onStatusChange: (uuid: string, newStatus: ComplaintStatus) => void;
    onViewDetails: (complaint: Complaint) => void;
}

const ComplaintCard: React.FC<ComplaintCardProps> = ({
    complaint,
    onStatusChange,
    onViewDetails
}) => {
    const nextStatus: Record<ComplaintStatus, ComplaintStatus> = {
        'to-do': 'in-progress',
        'in-progress': 'resolved',
        resolved: 'to-do'
    };

    return (
        <Card
            className="mb-5 cursor-pointer"
            onClick={() => onViewDetails(complaint)}
        >
            <CardContent className="p-4 flex flex-col gap-2">
                <h3 className="font-bold">PNR: {complaint.PNR}</h3>
                <p>Query: {complaint.originalQuery}</p>
                <p>Department: {complaint.department}</p>
                <p>Severity: {complaint.severity}</p>
                <p>UUID: {complaint.uuid}</p>
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(complaint.uuid, nextStatus[complaint.status]);
                    }}
                    className="mt-2"
                >
                    Move to {nextStatus[complaint.status]}
                </Button>
            </CardContent>
        </Card>
    );
};

interface KanbanColumnProps {
    title: string;
    complaints: Complaint[];
    onStatusChange: (uuid: string, newStatus: ComplaintStatus) => void;
    onViewDetails: (complaint: Complaint) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
    title,
    complaints,
    onStatusChange,
    onViewDetails
}) => {
    const getColumnColor = (columnTitle: string): string => {
        switch (columnTitle.toLowerCase()) {
            case 'to do':
                return 'bg-yellow-50';
            case 'in progress':
                return 'bg-blue-50';
            case 'resolved':
                return 'bg-green-100';
            default:
                return 'bg-gray-50';
        }
    };

    const bgColor = getColumnColor(title);

    return (
        <div className={`p-4 rounded-lg w-1/3 ${bgColor}`}>
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            {complaints.map((complaint) => (
                <ComplaintCard
                    key={complaint.uuid}
                    complaint={complaint}
                    onStatusChange={onStatusChange}
                    onViewDetails={onViewDetails}
                />
            ))}
        </div>
    );
};
//@ts-ignore
const DepartmentDropdown = ({ departments, selectedDepartment, onDepartmentChange }) => {
    return (
        <Select onValueChange={onDepartmentChange} value={selectedDepartment}>
            <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>

                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept: any) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};


const ComplaintsKanbanBoard: React.FC = () => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<Complaint | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

    const departments = [
        'Luggage/Parcels',
        'Goods',
        'Medical Assistance',
        'Facilities For women With special needs',
        'Divyangjan Facilities',
        'Passenger Amenities',
        'Cleanliness',
        'Water Availability',
        'Catering and Vending Service',
        'Miscellaneous',
        'Staff Behaviour',
        'Electrical Equipment',
        'Reserved Tickets',
        'Unreserved Tickets',
        'Refund of Tickets',
        'Overcrowding in Coaches',
        'Sexual Harassment/Misbehaviour',
        'Chain Pulling',
        'Nuisance by Unauthorized Persons',
        'Harassment/Extortion by Authorities',
        'Suspicious or Unclaimed Items',
        'Missing or Unresponsive Passenger',
        'Substance Abuse',
        'Violence/Disorder',
        'Passenger Accident',
        'Lost/Found',
        'Other Issues'
    ];

    const fetchComplaints = async (dept?: string) => {
        try {
            setIsLoading(true);
            setError(null);
            console.log(`Fetching complaints for department: ${dept || 'all'}`);
            const result: any = await getAllComplaints(dept);
            if (Array.isArray(result)) {
                console.log('Fetched complaints:', result);
                setComplaints(result);
            } else {
                throw new Error('Unexpected response from getAllComplaints');
            }
        } catch (error) {
            console.error('Error fetching complaints:', error);
            setError('Failed to fetch complaints. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const handleStatusChange = async (
        uuid: string,
        newStatus: ComplaintStatus
    ) => {
        console.log(`Attempting to update complaint ${uuid} to status ${newStatus}`);
        try {
            const updatedComplaint = await updateComplaintStatus(uuid, newStatus);
            console.log('Received updated complaint:', updatedComplaint);
            // @ts-ignore
            setComplaints((prevComplaints) =>
                prevComplaints.map((complaint) =>
                    complaint.uuid === uuid ? updatedComplaint : complaint
                )
            );
        } catch (error) {
            console.error('Failed to update complaint status:', error);
            setError('Failed to update complaint status. Please try again.');
        }
    };

    const handleViewDetails = (complaint: Complaint) => {
        console.log('Viewing details for complaint:', complaint);
        setSelectedTicket(complaint);
    };

    const closePopup = () => {
        console.log('Closing ticket details popup');
        setSelectedTicket(null);
    };

    const handleDepartmentChange = (department: string) => {
        setSelectedDepartment(department);
        fetchComplaints(department === 'all' ? undefined : department);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold my-10 mx-auto w-full text-center text-[#75002b]">
                Complaints Kanban Board
            </h1>
            <div className="mb-6">
                <DepartmentDropdown
                    departments={departments}
                    selectedDepartment={selectedDepartment}
                    onDepartmentChange={handleDepartmentChange}
                />
            </div>
            <div className="flex space-x-4">
                <KanbanColumn
                    title="To Do"
                    complaints={complaints.filter((c) => c.status === 'to-do')}
                    onStatusChange={handleStatusChange}
                    onViewDetails={handleViewDetails}
                />
                <KanbanColumn
                    title="In Progress"
                    complaints={complaints.filter((c) => c.status === 'in-progress')}
                    onStatusChange={handleStatusChange}
                    onViewDetails={handleViewDetails}
                />
                <KanbanColumn
                    title="Resolved"
                    complaints={complaints.filter((c) => c.status === 'resolved')}
                    onStatusChange={handleStatusChange}
                    onViewDetails={handleViewDetails}
                />
            </div>
            {selectedTicket && (
                <TicketDetailsPopup ticket={selectedTicket} onClose={closePopup} />
            )}
        </div>
    );
};

export default ComplaintsKanbanBoard;

