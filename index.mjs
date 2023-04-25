import * as mysql from 'mysql';
import  express  from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

const app = express();
app.use(cors({
  origin: '*'
}));
app.use(express.urlencoded({ extended: true }));
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port:process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

 
  app.listen(3000,()=>{
    console.log("listen on port 3000")
  })

  app.get('/film',(req,res)=>{
    let page = req.query.page || 1;
    let postPerPage=req.query.postPerPage||10;
    
    const {sortBy,OrderBy}=req.query
    console.log("req.query",OrderBy)
    const Filmquery = `
      SELECT film.film_id,film.title AS Nom_du_film, film.rental_rate AS Prix_de_location, film.rating AS Classement,
      category.name AS Nom_du_genre,
      COUNT(rental.rental_id) AS Nombre_de_locations
      FROM film
      JOIN film_category ON film.film_id = film_category.film_id
      JOIN category ON film_category.category_id = category.category_id
      JOIN inventory ON film.film_id = inventory.film_id
      JOIN rental ON inventory.inventory_id = rental.inventory_id
      GROUP BY film.title, category.name
      ORDER BY ${sortBy} ${OrderBy}
      LIMIT ${((postPerPage*page)-postPerPage)},${postPerPage} 
      ;
    `
    const TotalFilmQuery='select count(*) AS nb_films from film';

    connection.query(Filmquery,(err,filmsResult)=>{
      connection.query(TotalFilmQuery,(err2,totalResultats)=>{
        return res.status(200).json({
          data:filmsResult,
          nowPage:parseInt(page),
          totalPage:Math.ceil(totalResultats[0].nb_films/postPerPage),
         
        })
      })
    })
  })