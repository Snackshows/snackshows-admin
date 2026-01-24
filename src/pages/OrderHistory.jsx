import React, { useState } from 'react';
import { FaEye, FaDownload } from 'react-icons/fa';
import Table from '../components/common/Table';
import { useToast } from '../components/common/Toast';
import './OrderHistory.css';

const OrderHistory = () => {
	const toast = useToast();
	const [orders] = useState([
		{
			id: 'ORD-001',
			user: 'John Doe',
			type: 'VIP Plan',
			amount: 9.99,
			method: 'Credit Card',
			date: '2024-12-20',
			status: 'Completed',
		},
		{
			id: 'ORD-002',
			user: 'Jane Smith',
			type: 'Coin Pack',
			amount: 4.99,
			method: 'PayPal',
			date: '2024-12-19',
			status: 'Completed',
		},
		{
			id: 'ORD-003',
			user: 'Bob Wilson',
			type: 'VIP Plan',
			amount: 19.99,
			method: 'Credit Card',
			date: '2024-12-18',
			status: 'Pending',
		},
		{
			id: 'ORD-004',
			user: 'Alice Brown',
			type: 'Coin Pack',
			amount: 0.99,
			method: 'Google Pay',
			date: '2024-12-17',
			status: 'Completed',
		},
		{
			id: 'ORD-005',
			user: 'Charlie Davis',
			type: 'VIP Plan',
			amount: 9.99,
			method: 'Apple Pay',
			date: '2024-12-16',
			status: 'Failed',
		},
		{
			id: 'ORD-006',
			user: 'David Miller',
			type: 'Coin Pack',
			amount: 34.99,
			method: 'Credit Card',
			date: '2024-12-15',
			status: 'Completed',
		},
		{
			id: 'ORD-007',
			user: 'Emma Wilson',
			type: 'VIP Plan',
			amount: 4.99,
			method: 'PayPal',
			date: '2024-12-14',
			status: 'Refunded',
		},
		{
			id: 'ORD-008',
			user: 'Frank Thomas',
			type: 'Coin Pack',
			amount: 8.99,
			method: 'Credit Card',
			date: '2024-12-13',
			status: 'Completed',
		},
	]);

	const columns = [
		{ header: 'ORDER ID', accessor: 'id' },
		{ header: 'USER', accessor: 'user' },
		{ header: 'TYPE', accessor: 'type' },
		{ header: 'AMOUNT', accessor: 'amount', render: (row) => `$${row.amount}` },
		{ header: 'METHOD', accessor: 'method' },
		{ header: 'DATE', accessor: 'date' },
		{
			header: 'STATUS',
			render: (row) => (
				<span className={`status-badge status-${row.status.toLowerCase()}`}>
					{row.status}
				</span>
			),
		},
		{
			header: 'ACTION',
			render: () => (
				<button
					className="btn btn-sm btn-outline"
					onClick={() => toast.info('View order details')}
				>
					<FaEye /> View
				</button>
			),
		},
	];

	return (
		<div className="order-history-page">
			<div className="page-header">
				<h2 className="page-title">Order History</h2>
				<button
					className="btn btn-outline"
					onClick={() => toast.success('Export started')}
				>
					<FaDownload /> Export
				</button>
			</div>
			<div className="stats-row">
				<div className="stat-mini">
					<div className="value">{orders.length}</div>
					<div className="label">Total Orders</div>
				</div>
				<div className="stat-mini">
					<div className="value">
						${orders.reduce((s, o) => s + o.amount, 0).toFixed(2)}
					</div>
					<div className="label">Total Revenue</div>
				</div>
				<div className="stat-mini">
					<div className="value">
						{orders.filter((o) => o.status === 'Completed').length}
					</div>
					<div className="label">Completed</div>
				</div>
				<div className="stat-mini">
					<div className="value">
						{orders.filter((o) => o.status === 'Pending').length}
					</div>
					<div className="label">Pending</div>
				</div>
			</div>
			<Table columns={columns} data={orders} />
		</div>
	);
};

export default OrderHistory;
