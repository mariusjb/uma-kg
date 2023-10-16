import React from "react";

function CardGrid({ filteredData }) {
  // Create an array of cards based on the filteredData
  const cards = filteredData.map((movie, i) => ({
    id: i + 1,
    title: `${movie.title} (${movie.year})`,
    tags: movie.tags, // Include tags from movie data
  }));

  return (
    <div className="container mt-4">
      <div className="row">
        {cards.map((card) => (
          <div key={card.id} className="col-md-2 mb-3">
            <div className="card d-flex flex-column h-100">
              <img
                src={`https://via.placeholder.com/150x150?text=Card${card.id}`}
                className="card-img-top"
                alt={`Card ${card.id}`}
              />
              <div className="card-body d-flex flex-column justify-content-between">
                <h5 className="card-title">{card.title}</h5>
                <div>
                  {card.tags.map((tag, index) => (
                    <span key={index} className="badge">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CardGrid;