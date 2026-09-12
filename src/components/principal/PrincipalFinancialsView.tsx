import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { SchoolFeeTransaction, FeeDefaulterRecord, ExpenseApprovalRequest } from '../../types';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Plus,
  Send,
  Download,
  Building,
  Check,
  X,
  FileText,
  Phone,
  Mail,
  User,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Layers
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const PrincipalFinancialsView: React.FC = () => {
  const {
    schoolFeeSummary,
    schoolFeeTransactions,
    feeDefaulters,
    expenseRequests,
    approveExpenseRequest,
    rejectExpenseRequest,
    addExpenseRequest,
    sendDefaulterReminder,
    resolveDefaulter,
    addSchoolFeeTransaction
  } = useERP();

  // Internal Subtabs
  const [finSubTab, setFinSubTab] = useState<'overview' | 'transactions' | 'defaulters' | 'expenses'>('overview');

  // Search & Filters
  const [txnSearch, setTxnSearch] = useState('');
  const [txnCategoryFilter, setTxnCategoryFilter] = useState('All');
  const [defaulterClassFilter, setDefaulterClassFilter] = useState('All');
  const [expenseStatusFilter, setExpenseStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  // Modals
  const [isNewExpenseModalOpen, setIsNewExpenseModalOpen] = useState(false);
  const [isNewPaymentModalOpen, setIsNewPaymentModalOpen] = useState(false);
  const [selectedExpenseForReview, setSelectedExpenseForReview] = useState<ExpenseApprovalRequest | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<SchoolFeeTransaction | null>(null);

  // New Expense Form State
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpCategory, setNewExpCategory] = useState<ExpenseApprovalRequest['category']>('Laboratory & Equipment');
  const [newExpAmount, setNewExpAmount] = useState<number>(25000);
  const [newExpSubmittedBy, setNewExpSubmittedBy] = useState('Mr. Rajesh Sharma (HOD Physics)');
  const [newExpDept, setNewExpDept] = useState('Science Department');
  const [newExpVendor, setNewExpVendor] = useState('Scientific Lab Solutions Pvt Ltd');
  const [newExpBillNo, setNewExpBillNo] = useState(`INV/2026/${Math.floor(100 + Math.random() * 900)}`);
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpPriority, setNewExpPriority] = useState<ExpenseApprovalRequest['priority']>('Standard');

  // New Fee Payment Form State
  const [payStudentName, setPayStudentName] = useState('');
  const [payStudentId, setPayStudentId] = useState('STU001');
  const [payClass, setPayClass] = useState('Class 11 (Sec A)');
  const [payRoll, setPayRoll] = useState('01');
  const [payAmount, setPayAmount] = useState<number>(47500);
  const [payCategory, setPayCategory] = useState<SchoolFeeTransaction['category']>('Tuition Fee');
  const [payMethod, setPayMethod] = useState<SchoolFeeTransaction['paymentMethod']>('UPI');

  // Aggregated Financial Metrics
  const totalExpectedFees = useMemo(() => {
    return schoolFeeSummary.reduce((acc, curr) => acc + curr.totalAnnualFee, 0);
  }, [schoolFeeSummary]);

  const totalCollectedFees = useMemo(() => {
    return schoolFeeSummary.reduce((acc, curr) => acc + curr.collectedAmount, 0);
  }, [schoolFeeSummary]);

  const totalPendingDues = useMemo(() => {
    return schoolFeeSummary.reduce((acc, curr) => acc + curr.pendingAmount, 0);
  }, [schoolFeeSummary]);

  const overallCollectionRate = useMemo(() => {
    if (totalExpectedFees === 0) return 0;
    return Number(((totalCollectedFees / totalExpectedFees) * 100).toFixed(1));
  }, [totalExpectedFees, totalCollectedFees]);

  const pendingExpensesCount = useMemo(() => {
    return expenseRequests.filter((e) => e.status === 'Pending').length;
  }, [expenseRequests]);

  const pendingExpensesAmount = useMemo(() => {
    return expenseRequests
      .filter((e) => e.status === 'Pending')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenseRequests]);

  // Chart Data Preparation
  const classComparisonChartData = useMemo(() => {
    return schoolFeeSummary.map((item) => ({
      name: `${item.className} (${item.section.split(' ')[1] || 'A'})`,
      Collected: Math.round(item.collectedAmount / 1000), // in Thousands ₹
      Pending: Math.round(item.pendingAmount / 1000),
      Target: Math.round(item.totalAnnualFee / 1000),
      rate: item.collectionRate
    }));
  }, [schoolFeeSummary]);

  const feeDistributionPieData = [
    { name: 'Collected Fees', value: totalCollectedFees, color: '#10b981' },
    { name: 'Pending / Overdue', value: totalPendingDues, color: '#f59e0b' }
  ];

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return schoolFeeTransactions.filter((txn) => {
      const matchSearch =
        txn.studentName.toLowerCase().includes(txnSearch.toLowerCase()) ||
        txn.receiptNo.toLowerCase().includes(txnSearch.toLowerCase()) ||
        txn.rollNo.includes(txnSearch) ||
        txn.studentId.toLowerCase().includes(txnSearch.toLowerCase());
      const matchCategory = txnCategoryFilter === 'All' || txn.category === txnCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [schoolFeeTransactions, txnSearch, txnCategoryFilter]);

  // Filtered Defaulters
  const filteredDefaulters = useMemo(() => {
    return feeDefaulters.filter((def) => {
      if (defaulterClassFilter === 'All') return true;
      return def.className.toLowerCase().includes(defaulterClassFilter.toLowerCase());
    });
  }, [feeDefaulters, defaulterClassFilter]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenseRequests.filter((exp) => {
      if (expenseStatusFilter === 'All') return true;
      return exp.status === expenseStatusFilter;
    });
  }, [expenseRequests, expenseStatusFilter]);

  const handleCreateExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpTitle.trim() || !newExpAmount) return;

    addExpenseRequest({
      billNumber: newExpBillNo,
      title: newExpTitle,
      category: newExpCategory,
      amount: Number(newExpAmount),
      submittedBy: newExpSubmittedBy,
      department: newExpDept,
      vendorName: newExpVendor,
      description: newExpDesc || 'Institutional expense sanctioned for academic and campus needs.',
      priority: newExpPriority
    });

    setIsNewExpenseModalOpen(false);
    setNewExpTitle('');
    setNewExpDesc('');
  };

  const handleLogPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payStudentName.trim() || !payAmount) return;

    const receiptNo = `REC/26-27/${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];

    addSchoolFeeTransaction({
      receiptNo,
      studentId: payStudentId,
      studentName: payStudentName,
      className: payClass,
      rollNo: payRoll,
      amount: Number(payAmount),
      category: payCategory,
      date: today,
      paymentMethod: payMethod,
      status: 'Success',
      transactionRef: `${payMethod}/REC-${Date.now().toString().slice(-6)}`
    });

    setIsNewPaymentModalOpen(false);
    setPayStudentName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Sub-Navigation */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-slate-200/80 dark:border-neutral-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                FINANCIAL DESK
              </span>
              <span className="text-xs font-bold text-slate-500">Academic Year 2026-2027</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Fee Collection & Financial Tracking
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive institutional accounts, class-wise revenue streams, overdue defaulters, and expense bills
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsNewPaymentModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs ease-in-out active:scale-[0.98] duration-150"
            >
              <Plus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>Log Fee Payment</span>
            </button>

            <button
              onClick={() => setIsNewExpenseModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-amber-600/20 active:scale-[0.98] duration-150 ease-in-out"
            >
              <Plus className="w-4 h-4" />
              <span>New Expense Request</span>
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Financial Overview & Charts', icon: BarChart3, badge: `${overallCollectionRate}%` },
            { id: 'transactions', label: 'Recent Fee Receipts', icon: Receipt, badge: `${schoolFeeTransactions.length}` },
            { id: 'defaulters', label: 'Fee Defaulters Desk', icon: AlertTriangle, badge: `${feeDefaulters.length} Due` },
            { id: 'expenses', label: 'Expense Approval Workflow', icon: DollarSign, badge: `${pendingExpensesCount} Pending` }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = finSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFinSubTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                    : 'bg-slate-100/80 dark:bg-neutral-900/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* METRIC KPI TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-slate-200/80 dark:border-neutral-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Expected Revenue</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            ₹{(totalExpectedFees / 100000).toFixed(2)} <span className="text-xs font-bold text-slate-500">Lakhs</span>
          </p>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <span>4 Classes</span> • <span>110 Total Enrolled</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-slate-200/80 dark:border-neutral-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Fees Collected</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{(totalCollectedFees / 100000).toFixed(2)} <span className="text-xs font-bold text-slate-500">Lakhs</span>
          </p>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{overallCollectionRate}% collection rate</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-slate-200/80 dark:border-neutral-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Outstanding Dues</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
            ₹{(totalPendingDues / 100000).toFixed(2)} <span className="text-xs font-bold text-slate-500">Lakhs</span>
          </p>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-bold">
            <span>{feeDefaulters.length} active defaulter students</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-slate-200/80 dark:border-neutral-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Pending Expense Invoices</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {pendingExpensesCount} <span className="text-xs font-bold text-slate-500">Bills</span>
          </p>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <span>₹{pendingExpensesAmount.toLocaleString()} awaiting sanction</span>
          </div>
        </div>
      </div>

      {/* TAB 1: FINANCIAL OVERVIEW & CHARTS */}
      {finSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Main Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Class-wise Bar Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-slate-200/80 dark:border-neutral-800 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Class-wise Fee Collection vs. Pending Dues
                  </h3>
                  <p className="text-xs text-slate-500">Values represented in Thousands of INR (₹ '000)</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Collected</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Pending</span>
                  </div>
                </div>
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classComparisonChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}k`} />
                    <Tooltip
                      formatter={(val: any, name: any) => [`₹${(Number(val) * 1000).toLocaleString()}`, name]}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '1rem',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    />
                    <Bar dataKey="Collected" fill="#10b981" radius={[6, 6, 0, 0]} barSize={28} />
                    <Bar dataKey="Pending" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Overall Revenue Ratio Pie Chart */}
            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-slate-200/80 dark:border-neutral-800 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Revenue Realization</h3>
                <p className="text-xs text-slate-500">Overall collection realization ratio</p>

                <div className="h-[180px] w-full my-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={feeDistributionPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {feeDistributionPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Amount']}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '1rem',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-neutral-800">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Collected Fees ({overallCollectionRate}%)
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{totalCollectedFees.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Pending Dues ({(100 - overallCollectionRate).toFixed(1)}%)
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{totalPendingDues.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Class-wise Financial Performance Table */}
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-slate-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Class-wise Revenue Breakdown</h3>
                <p className="text-xs text-slate-500">Departmental & section target compliance</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-300">
                {schoolFeeSummary.length} Active Batches
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-neutral-800 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Class & Stream</th>
                    <th className="py-3 px-4">Students</th>
                    <th className="py-3 px-4">Total Expected</th>
                    <th className="py-3 px-4">Collected</th>
                    <th className="py-3 px-4">Pending Dues</th>
                    <th className="py-3 px-4">Collection Rate</th>
                    <th className="py-3 px-4 text-right">Defaulters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {schoolFeeSummary.map((cls) => (
                    <tr key={cls.classCode} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors active:scale-[0.98] duration-150 ease-in-out">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 font-mono text-[11px]">
                            {cls.classCode}
                          </span>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white">{cls.className} ({cls.section})</p>
                            <p className="text-[11px] font-medium text-slate-500">{cls.stream}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {cls.totalStudents} Enrolled
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        ₹{cls.totalAnnualFee.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{cls.collectedAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                        ₹{cls.pendingAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-20 bg-slate-100 dark:bg-neutral-900 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all"
                              style={{ width: `${cls.collectionRate}%` }}
                            />
                          </div>
                          <span className="font-black text-slate-800 dark:text-slate-200">{cls.collectionRate}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          {cls.defaultersCount} Students
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RECENT TRANSACTIONS */}
      {finSubTab === 'transactions' && (
        <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-slate-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Official Fee Receipts & Transactions</h3>
              <p className="text-xs text-slate-500">Real-time incoming student fee receipts log</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search receipt, student or roll..."
                  value={txnSearch}
                  onChange={(e) => setTxnSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 w-56"
                />
              </div>

              <select
                value={txnCategoryFilter}
                onChange={(e) => setTxnCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Tuition Fee">Tuition Fee</option>
                <option value="Laboratory Fee">Laboratory Fee</option>
                <option value="Examination Fee">Examination Fee</option>
                <option value="Transport & Bus">Transport & Bus</option>
                <option value="Library & Sports">Library & Sports</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-neutral-800 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Receipt No & Date</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class & Roll</th>
                  <th className="py-3 px-4">Fee Category</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors active:scale-[0.98] duration-150 ease-in-out">
                    <td className="py-3.5 px-4">
                      <p className="font-mono font-bold text-slate-900 dark:text-white">{txn.receiptNo}</p>
                      <p className="text-[11px] text-slate-500">{txn.date}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {txn.studentName}
                      <span className="block text-[10px] font-mono text-slate-400 font-normal">{txn.studentId}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      <span className="font-semibold">{txn.className}</span>
                      <span className="block text-[10px] text-slate-500">Roll No: {txn.rollNo}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {txn.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400">
                      {txn.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-emerald-600 dark:text-emerald-400">
                      ₹{txn.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 w-fit">
                        <Check className="w-3 h-3" />
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(txn)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1 ease-in-out active:scale-[0.98] duration-150"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FEE DEFAULTERS */}
      {finSubTab === 'defaulters' && (
        <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-slate-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Overdue Fee Defaulters Registry</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black">
                  {feeDefaulters.filter((d) => d.status !== 'Resolved').length} Active
                </span>
              </div>
              <p className="text-xs text-slate-500">Official notice dispatch & recovery tracking</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={defaulterClassFilter}
                onChange={(e) => setDefaulterClassFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              >
                <option value="All">All Classes</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-neutral-800 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Student & Roll</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Guardian / Parent Details</th>
                  <th className="py-3 px-4">Overdue Amount</th>
                  <th className="py-3 px-4">Due Since & Days</th>
                  <th className="py-3 px-4">Reminders Sent</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredDefaulters.map((def) => (
                  <tr key={def.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors active:scale-[0.98] duration-150 ease-in-out">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {def.name}
                      <span className="block text-[11px] text-slate-500 font-mono font-normal">
                        Roll: {def.rollNo} • ID: {def.studentId}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {def.className}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      <p className="font-semibold text-slate-900 dark:text-white">{def.guardianName}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {def.guardianPhone}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-amber-600 dark:text-amber-400">
                      ₹{def.dueAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{def.dueSince}</span>
                      <span className="block text-[10px] text-red-500 font-bold">{def.overdueDays} Days overdue</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      <span className="p-1 px-2 rounded-md bg-slate-100 dark:bg-neutral-900 font-mono text-[11px]">
                        {def.remindersCount} Notice{def.remindersCount === 1 ? '' : 's'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          def.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : def.status === 'Notice Sent'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {def.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {def.status !== 'Resolved' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => sendDefaulterReminder(def.id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs active:scale-[0.98] duration-150 ease-in-out"
                            title="Send SMS and Email Reminder"
                          >
                            <Send className="w-3 h-3" />
                            <span>Remind</span>
                          </button>
                          <button
                            onClick={() => resolveDefaulter(def.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs active:scale-[0.98] duration-150 ease-in-out"
                            title="Reconcile / Mark Cleared"
                          >
                            <Check className="w-3 h-3" />
                            <span>Clear</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600">Reconciled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: EXPENSE APPROVAL WORKFLOW */}
      {finSubTab === 'expenses' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-slate-200/80 dark:border-neutral-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Institutional Budget & Expense Sanction Desk</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-xs font-black">
                  Principal Authority
                </span>
              </div>
              <p className="text-xs text-slate-500">Review, approve or decline departmental lab, sports, and infrastructure procurement bills</p>
            </div>

            <div className="flex items-center gap-2">
              {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setExpenseStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    expenseStatusFilter === st
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-slate-200/80 dark:border-neutral-800 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-neutral-700">
                      {exp.billNumber}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          exp.priority === 'Urgent'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {exp.priority}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          exp.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : exp.status === 'Rejected'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                        }`}
                      >
                        {exp.status}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">{exp.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{exp.description}</p>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-500">
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block">Department:</span>
                      <span>{exp.department}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block">Submitted By:</span>
                      <span>{exp.submittedBy}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block">Vendor Name:</span>
                      <span>{exp.vendorName}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block">Submitted Date:</span>
                      <span>{exp.submissionDate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Sanction Amount</span>
                    <p className="text-lg font-black text-slate-900 dark:text-white font-mono">
                      ₹{exp.amount.toLocaleString()}
                    </p>
                  </div>

                  {exp.status === 'Pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedExpenseForReview(exp);
                          setReviewRemarks('Declined due to budget allocation limits.');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-600 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-[0.98] duration-150 ease-in-out"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedExpenseForReview(exp);
                          setReviewRemarks('Sanctioned from Academic & Lab Equipment Grant.');
                        }}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-600/20 active:scale-[0.98] duration-150 ease-in-out"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Bill</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-right text-[11px] text-slate-500">
                      <span className="font-semibold block">{exp.principalRemarks || 'Processed'}</span>
                      <span>Decision on: {exp.decisionDate}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: EXPENSE REVIEW & DECISION */}
      {selectedExpenseForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Principal Expense Review</h3>
              <button
                onClick={() => setSelectedExpenseForReview(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-neutral-900/60 space-y-1.5 text-xs">
              <p className="font-bold text-slate-900 dark:text-white">{selectedExpenseForReview.title}</p>
              <p className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                ₹{selectedExpenseForReview.amount.toLocaleString()}
              </p>
              <p className="text-slate-500">Vendor: {selectedExpenseForReview.vendorName}</p>
              <p className="text-slate-500">Department: {selectedExpenseForReview.department}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Principal Remarks / Approval Order</label>
              <textarea
                rows={3}
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                placeholder="Enter remarks, budget head or sanction instructions..."
                className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  rejectExpenseRequest(selectedExpenseForReview.id, reviewRemarks);
                  setSelectedExpenseForReview(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
              >
                Reject Request
              </button>
              <button
                onClick={() => {
                  approveExpenseRequest(selectedExpenseForReview.id, reviewRemarks);
                  setSelectedExpenseForReview(null);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-600/20 active:scale-[0.98] duration-150 ease-in-out"
              >
                Sanction & Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOG NEW EXPENSE REQUEST */}
      {isNewExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Submit New Expense Bill</h3>
                <p className="text-xs text-slate-500">Log procurement or utility bills for school records</p>
              </div>
              <button
                onClick={() => setIsNewExpenseModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpenseSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Expense Title / Item</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Optics Bench & Lasers for Physics Lab"
                  value={newExpTitle}
                  onChange={(e) => setNewExpTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={newExpCategory}
                    onChange={(e) => setNewExpCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Laboratory & Equipment">Laboratory & Equipment</option>
                    <option value="Sports & Events">Sports & Events</option>
                    <option value="IT Infrastructure & Software">IT Infrastructure & Software</option>
                    <option value="Library & CBSE Books">Library & CBSE Books</option>
                    <option value="Campus Maintenance & Utilities">Campus Maintenance & Utilities</option>
                    <option value="Academic Printing & Stationary">Academic Printing & Stationary</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Amount (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={newExpAmount}
                    onChange={(e) => setNewExpAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Submitted By</label>
                  <input
                    type="text"
                    value={newExpSubmittedBy}
                    onChange={(e) => setNewExpSubmittedBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Department</label>
                  <input
                    type="text"
                    value={newExpDept}
                    onChange={(e) => setNewExpDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Vendor Name</label>
                  <input
                    type="text"
                    value={newExpVendor}
                    onChange={(e) => setNewExpVendor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Priority</label>
                  <select
                    value={newExpPriority}
                    onChange={(e) => setNewExpPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="Standard">Standard</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Description / Bill Notes</label>
                <textarea
                  rows={2}
                  value={newExpDesc}
                  onChange={(e) => setNewExpDesc(e.target.value)}
                  placeholder="Details regarding quotation, item specs or delivery timeframe..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-200 cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-amber-600/20 active:scale-[0.98] duration-150 ease-in-out"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG MANUAL FEE PAYMENT */}
      {isNewPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Log Student Fee Payment</h3>
                <p className="text-xs text-slate-500">Record cash/bank transfer receipt directly</p>
              </div>
              <button
                onClick={() => setIsNewPaymentModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogPaymentSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diya Patel"
                  value={payStudentName}
                  onChange={(e) => setPayStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Class & Section</label>
                  <select
                    value={payClass}
                    onChange={(e) => setPayClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Class 11 (Sec A)">Class 11 (Sec A)</option>
                    <option value="Class 12 (Sec A)">Class 12 (Sec A)</option>
                    <option value="Class 10 (Sec A)">Class 10 (Sec A)</option>
                    <option value="Class 9 (Sec A)">Class 9 (Sec A)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Roll No</label>
                  <input
                    type="text"
                    value={payRoll}
                    onChange={(e) => setPayRoll(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Fee Category</label>
                  <select
                    value={payCategory}
                    onChange={(e) => setPayCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Tuition Fee">Tuition Fee</option>
                    <option value="Laboratory Fee">Laboratory Fee</option>
                    <option value="Examination Fee">Examination Fee</option>
                    <option value="Transport & Bus">Transport & Bus</option>
                    <option value="Annual Composite">Annual Composite</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Card">Credit/Debit Card</option>
                    <option value="NetBanking">NetBanking</option>
                    <option value="Cash">Cash at Counter</option>
                    <option value="Demand Draft">Demand Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Amount (₹ INR)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-200 cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-600/20 active:scale-[0.98] duration-150 ease-in-out"
                >
                  Confirm & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW RECEIPT DETAILS */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">Official Payment Voucher</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">RECEIPT NO</span>
                <span className="font-mono font-black text-xs text-slate-900 dark:text-white">{selectedReceipt.receiptNo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">STUDENT</span>
                <span className="font-bold text-xs text-slate-900 dark:text-white">{selectedReceipt.studentName} ({selectedReceipt.rollNo})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">CLASS</span>
                <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">{selectedReceipt.className}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">CATEGORY</span>
                <span className="font-bold text-xs text-blue-600 dark:text-blue-400">{selectedReceipt.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">PAYMENT MODE</span>
                <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">REF CODE</span>
                <span className="font-mono text-[11px] text-slate-500">{selectedReceipt.transactionRef}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-neutral-700 flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-white">TOTAL RECEIVED</span>
                <span className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400">
                  ₹{selectedReceipt.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all cursor-pointer text-center active:scale-[0.98] duration-150 ease-in-out"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
