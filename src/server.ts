import app from './app';
import config from './config';
import { initDB } from './db';



const main = () => {
    initDB();
    app.listen(config.port, () => {
        console.log(`Server running on : http://localhost:${config.port}`);
    });
}

main();
