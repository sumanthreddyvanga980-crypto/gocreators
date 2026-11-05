import React, { useState } from 'react';
import { DollarSign, Plus, Trash2, X, Check, Calculator, PieChart, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

export const EditBudgetModal = ({ project, isOpen, onClose, onUpdated }) => {
  if (!isOpen || !project) return null;

  const initialTotal = project.budget?.total || 3000;
  const initialSpent = project.budget?.spent || 2100;
  const initialBreakdown = project.budget?.breakdown?.length > 0 
    ? project.budget.breakdown 
    : [
        { item: 'Camera Package & Vintage Anamorphic Lenses', cost: 1200, category: 'Camera' },
        { item: 'Cast Talent Fees (2 Leads)', cost: 600, category: 'Talent' },
        { item: 'Location Permits (Diner Set)', cost: 300, category: 'Location' },
        { item: 'Sound & Dialog Post-Production', cost: 400, category: 'Audio' },
        { item: 'Color Grading & Film Stock LUTs', cost: 500, category: 'Post' }
      ];

  const [total, setTotal] = useState(initialTotal);
  const [spent, setSpent] = useState(initialSpent);
  const [breakdown, setBreakdown] = useState(initialBreakdown);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCost, setNewItemCost] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto-calculate sum from breakdown items
  const sumOfBreakdown = breakdown.reduce((acc, b) => acc + (Number(b.cost) || 0), 0);

  const handleAddLineItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemCost) return;

    const costNum = Number(newItemCost);
    const updated = [...breakdown, { item: newItemName.trim(), cost: costNum, category: 'Production' }];
    setBreakdown(updated);
    setNewItemName('');
    setNewItemCost('');

    // If total is less than the sum of items, offer to auto-adjust total
    if (total < sumOfBreakdown + costNum) {
      setTotal(sumOfBreakdown + costNum);
    }
  };

  const handleRemoveLineItem = (index) => {
    setBreakdown(breakdown.filter((_, i) => i !== index));
  };

  const handleSaveBudget = async () => {
    setSaving(true);
    try {
      await api.updateProjectBudget(project._id, {
        total: Number(total),
        spent: Number(spent),
        breakdown
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onUpdated) onUpdated();
        onClose();
      }, 1000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Project Budget & Price Estimation
              </h3>
              <p className="text-[11px] text-slate-500">
                {project.title} • Customize budget targets & production line items
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          
          {/* Main Budget Inputs */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Spent / Committed ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={spent}
                  onChange={(e) => setSpent(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm font-bold text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Total Budget Goal ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-emerald-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm font-extrabold text-emerald-700 bg-white border border-emerald-300 rounded-xl focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="col-span-2 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Committed Progress:</span>
                <span>{total > 0 ? Math.round((spent / total) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, total > 0 ? (spent / total) * 100 : 0)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Line Items Breakdown Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-blue-600" />
                <span>Production Cost Estimates Breakdown</span>
              </h4>
              <span className="text-[11px] font-mono font-bold text-slate-600">
                Sum: ${sumOfBreakdown.toLocaleString()}
              </span>
            </div>

            {/* List of Line Items */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {breakdown.map((item, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs hover:border-slate-300 transition-colors"
                >
                  <span className="font-medium text-slate-800 truncate mr-2">
                    {item.item}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      ${Number(item.cost).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Line Item Form */}
          <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-2xl">
            <span className="text-[10px] font-bold text-blue-900 uppercase block mb-1.5">
              Add Cost Estimate Line Item
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g. Drone Camera Permit, Steadicam Op"
                className="flex-1 text-xs px-3 py-1.5 bg-white border border-blue-200 rounded-xl outline-none focus:border-blue-500"
              />
              <input
                type="number"
                value={newItemCost}
                onChange={(e) => setNewItemCost(e.target.value)}
                placeholder="$ Cost"
                className="w-24 text-xs px-2.5 py-1.5 bg-white border border-blue-200 rounded-xl outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={handleAddLineItem}
                disabled={!newItemName.trim() || !newItemCost}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-3">
          <button
            type="button"
            onClick={() => setTotal(sumOfBreakdown)}
            className="text-[11px] font-bold text-blue-600 hover:underline"
            title="Set total budget to exact sum of estimated breakdown items"
          >
            Auto-Sync Total (${sumOfBreakdown.toLocaleString()})
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveBudget}
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              {success ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>{saving ? 'Saving...' : 'Update Budget & Price'}</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

