import DB from "../config/Database.js";
import invoice from "./invoiceModel.js";
import Users from "./UserModel.js";
import transaction from "./transactionModel.js";

const generateDummyData = async () => {
    try {
        const user = await Users.findOne();
        if (!user) {
            console.error("No users found. Please create at least one user first.");
            process.exit(1);
        }
        const id_user = user.id;

        // Strictly 2 options for 'opsi' as requested
        const statuses = ["on_review", "completed", "closed", "rejected"];
        const opsis = ["technician", "sales"];
        const merchants = ["Stasiun Bahan Bakar", "Toko Peralatan", "Bengkel AHASS", "Rumah Makan", "Minimarket", "Parkir"];
        const categories = ["BBM", "Tools", "Maintenance", "Food", "Consumables", "Other"];

        const now = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);

        console.log(`Generating dummy data for 2 departments: ${opsis.join(' & ')}...`);

        const dummyInvoices = [];

        // Generate data for 52 weeks
        for (let i = 0; i < 52; i++) {
            const weekStart = new Date(oneYearAgo);
            weekStart.setDate(oneYearAgo.getDate() + (i * 7));
            const countInWeek = Math.floor(Math.random() * 3) + 2; 

            for (let j = 0; j < countInWeek; j++) {
                const invoiceDate = new Date(weekStart);
                invoiceDate.setDate(weekStart.getDate() + Math.floor(Math.random() * 7));
                if (invoiceDate > now) continue;

                const status = invoiceDate < new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) 
                    ? (Math.random() > 0.1 ? "closed" : "rejected") 
                    : statuses[Math.floor(Math.random() * statuses.length)]; 

                const total_harga = Math.floor(Math.random() * 4500000) + 50000; 
                const opsi = opsis[Math.floor(Math.random() * opsis.length)];

                dummyInvoices.push({
                    nama_invoice: `DUMMY-${invoiceDate.getFullYear()}${(invoiceDate.getMonth()+1).toString().padStart(2,'0')}-${i}${j}.pdf`,
                    id_user,
                    tanggal_upload: invoiceDate,
                    total_harga,
                    status,
                    keterangan: `Financial record for ${opsi} department - Batch ${i}`,
                    opsi, 
                    dept: null, 
                    acc_supervisor: status !== "on_review" ? "Auto-Seed System" : null,
                    acc_finance: ["completed", "closed"].includes(status) ? "Finance Audit" : null,
                    acc_direksi: ["completed", "closed"].includes(status) ? "Director Approval" : null,
                    acc_kasir: status === "closed" ? "Cashier Disbursement" : null,
                });
            }
        }

        console.log(`Bulk creating ${dummyInvoices.length} invoices...`);
        const createdInvoices = await invoice.bulkCreate(dummyInvoices, { returning: true });
        
        console.log(`Generating transactions for ${createdInvoices.length} invoices...`);
        const dummyTransactions = createdInvoices.map(inv => ({
            invoice_id: inv.id,
            id_user: inv.id_user,
            tanggal: inv.tanggal_upload,
            merchant: merchants[Math.floor(Math.random() * merchants.length)],
            kategori: categories[Math.floor(Math.random() * categories.length)],
            jumlah: inv.total_harga
        }));

        await transaction.bulkCreate(dummyTransactions);

        console.log("✅ Success! Dummy data generated for 2 departments with associated transactions.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error generating dummy data:", error);
        process.exit(1);
    }
};

generateDummyData();
