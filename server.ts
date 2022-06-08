import app from './src/app';

app.listen(process.env.PORT || 8080, () => {
    console.log(`⚡ Rodando em ${process.env.PORT || 8080}`);
})