import mysql from 'mysql'
import express, { Request, Response } from 'express'
import moment from 'moment'

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "aspiresub"
});


const app = express();
app.use(express.json());

app.post("/createloan", async (req: Request, res: Response) => {
    const { userId, amount, term, currencyCode } = req.body;
    const currentDate = new Date();
    let loanIdCurrent = 0;
    const result = await con.query('SELECT COUNT(*) as count FROM loans', (err, results) => {
        if (err) {
            throw err;
        }
        loanIdCurrent = results[0].count + 1;
        console.log(loanIdCurrent);

        let applicationDate = new Date();
        let formattedApplicationDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const addLoan = con.query(`INSERT INTO loans(userId, loanId, amount, term, applicationDate, status) VALUES(${userId}, ${loanIdCurrent}, ${amount},${term}, "${formattedApplicationDate}", "PENDING")`, (err, results) => {
            if (err) {
                throw err;
            }

            const installment = amount / term;
            for (let i = 0; i < term; i++) {
                let installmentDate = new Date();
                installmentDate.setDate(applicationDate.getDate() + (7 * (i + 1)));
                let formattedInstallmentDate = installmentDate.toISOString().slice(0, 19).replace('T', ' ');
                const addRepayment = con.query(`INSERT INTO repayments(loanId, amount, paymentdate, status) VALUES(${loanIdCurrent}, ${installment}, "${formattedInstallmentDate}", "PENDING")`, (err, results) => {
                    if (err) {
                        throw err;
                    }
                    console.log("added repayment number " + (i + 1));
                })
            }
            res.send({ "loan id is": loanIdCurrent, "term": term, "installment amount": amount / term });
        });
    });
})


app.listen(3000, () => {
    console.log('Mini-aspire API is running on port 3000');
});


app.post("/approveloan", async (req: Request, res: Response) => {
    const { loanId } = req.body;
    const approveLoan = con.query(`UPDATE loans SET status="APPROVED" WHERE loanId=${loanId};`, (err, results) => {
        if (err) {
            throw err;
        }
        console.log(results);
        res.send({ "message": "Loan approval query executed", "loanId": loanId, "results": JSON.stringify(results) });
    })
})


interface Loan {
    userId: string;
    loanId: string;
    amount: number;
    term: number;
    applicationDate: Date;
    status: string;
}


app.get("/viewloan/:userId", async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const loanDetails = con.query(`SELECT * from loans WHERE userId=${userId};`, (err, results) => {
        if (err) {
            throw err;
        }
        console.log(results);
        const loans: Loan[] = results;
        res.json(loans);
    })
})

app.post("/repayment", async (req: Request, res: Response) => {
    let applicationDate = new Date();
    let formattedDate = applicationDate.toISOString().slice(0, 19).replace('T', ' ');
    const { loanId } = req.body;
    const addRepayment = con.query(`UPDATE repayments SET status="PAID" WHERE loanId=${loanId} AND paymentDate="${formattedDate}";`, async (err, results) => {
        if (err) {
            throw err;
        }

        //checking if all installments are paid
        let totalPendingPayments = 0;
        const count = await con.query('SELECT COUNT(*) as count FROM repayments WHERE status="PENDING";', (err, results) => {
            if (err) {
                throw err;
            }
            totalPendingPayments = results[0].count;
            if (totalPendingPayments == 0) {
                const makeLoanPaid = con.query(`UPDATE loans SET status="PAID" WHERE loanId=${loanId}";`, (err, results) => {
                    if (err) {
                        throw err;
                    }
                    console.log("Loan paid")
                })
            }
            console.log(results);
            const loans: Loan[] = results;
            res.json(loans);
        })
    })
}
)