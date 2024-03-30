import  express  from "express";
import bodyParser from 'body-parser';
import cookieParser from "cookie-parser";
import  pagosRoutes  from "./routes/pagos.routes.js";
import authRoutes from "./routes/auth.routes.js";
import  cors  from "cors";

const app = express()

app.use(cors({
    origin: ['http://localhost:5173', 'https://my-project-krxnpsm9v-ramg23s-projects.vercel.app','https://my-project-ramg23s-projects.vercel.app/'],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(pagosRoutes)
app.use('/api',authRoutes);


export default app
