import RequireAuth from '@/components/RequireAuth';

export default function DashboardPage() {
  return (
    <RequireAuth>
      <h1>Dashboard</h1>
      <p>Welcome to Prioritas Wellness Indonesia Webapp.</p><br></br>
      <h2>An Internal Web Application</h2>
      <br></br>
      <hr className="short-line"></hr>
      <br></br>
      
      <h3>List of Pages</h3>
        <li>Purchases</li>
        <li>Sales</li>
        <li>Deliveries</li>
        <li>Manufacturing</li>
        <li>Warehouses</li>
        <li>Invoices</li>
        <li>Expenses</li>

        <br></br>
        

        <br></br>
      <h3>Features - Guideline</h3>
      <hr className="short-line"></hr>
      <br></br>
      <h4>Purchases</h4>
        <li>List of Purchase Orders</li>
        <li>Purchase Requests.</li>
        <br></br>

      <h4>Sales</h4>
        <li>List of Sales Orders.</li>
        <li>Create Sales Order</li>
         <br></br>

      <h4>Deliveries</h4>
        <li>List of Deliveries, with status [Waiting, Partially Delivered, Fully Delivered]</li>
         <br></br>

      <h4>Manufacturing</h4>
        <li>List of Manufacturing Order</li>
        <li>List of Bill of Materials</li>
        <li>Create Purchase Requsts</li>
         <br></br>

      <h4>Warehouses</h4>
        <li>List of Raw Material</li>
        <li>List of Packaging</li>
        <li>List of Finished Good</li>
        <li>View Stocks</li>
         <br></br>

      <h4>Invoices</h4>
        <li>List of Invoices</li>
        <li>Track customer Invoices and Vendor Bills</li>
         <br></br>

      <h4>Expenses</h4>
        <li>List of Expenses, including Claims, PUM, BOP, etc</li>
         <br></br>
    </RequireAuth>
  );
}

