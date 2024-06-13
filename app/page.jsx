"use client"
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Divider, Textarea } from "@nextui-org/react";

async function fetchData() {
  const res = await fetch('https://official-joke-api.appspot.com/random_joke');

  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
}

export default function Home() {
  const [jokes, setJokes] = useState([]);
  const [currentJokeIndex, setCurrentJokeIndex] = useState(-1);
  const [favorites, setFavorites] = useState([]);
  const [editSetup, setEditSetup] = useState('');
  const [editPunchline, setEditPunchline] = useState('');

  useEffect(() => {
    if (currentJokeIndex >= 0) {
      setEditSetup(jokes[currentJokeIndex].setup);
      setEditPunchline(jokes[currentJokeIndex].punchline);
    }
  }, [currentJokeIndex]);

  const displayJoke = async () => {
    const newJoke = await fetchData();
    const jokeObject = {
      id: newJoke.id,
      type: newJoke.type,
      setup: newJoke.setup,
      punchline: newJoke.punchline
    };
    setJokes((prevJokes) => [...prevJokes, jokeObject])
    setCurrentJokeIndex(currentJokeIndex + 1);
  }

  const handlePrevious = () => {
    if (currentJokeIndex > 0) {
      setCurrentJokeIndex(currentJokeIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentJokeIndex < jokes.length - 1) {
      setCurrentJokeIndex(currentJokeIndex + 1);
    }
  };

  const addToFavorites = () => {
    const jokeToAdd = jokes[currentJokeIndex];
    if (!favorites.some(joke => joke.id === jokeToAdd.id)) {
      setFavorites(prevFavorites => [...prevFavorites, jokeToAdd]);
    }
  };

  const removeFromFavorites = (jokeToRemove) => {
    setFavorites(prevFavorites => prevFavorites.filter(joke => joke.id !== jokeToRemove.id));
  };

  const removeJoke = (jokeToRemove) => {
    setJokes(prevJokes => prevJokes.filter(joke => joke.id !== jokeToRemove.id));
    setFavorites(prevFavorites => prevFavorites.filter(joke => joke.id !== jokeToRemove.id));
    setCurrentJokeIndex(currentJokeIndex - 1); 
  };

  const saveEditedJoke = () => {
    if (currentJokeIndex >= 0) {
      const updatedJokes = [...jokes];
      updatedJokes[currentJokeIndex] = {
        ...updatedJokes[currentJokeIndex],
        setup: editSetup,
        punchline: editPunchline,
      };
      setJokes(updatedJokes);

      const updatedFavorites = favorites.map(favorite =>
        favorite.id === jokes[currentJokeIndex].id
          ? { ...favorite, setup: editSetup, punchline: editPunchline }
          : favorite
      );
      setFavorites(updatedFavorites);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <button className="bg-blue text-white rounded-2xl px-1.5 py-1.5 mb-4" onClick={displayJoke}>
        Get Random Joke
      </button>

      <Card className="min-w-[400px] max-w-[800px] border-2 border-gray-300 rounded-lg p-2 mb-4">
        <CardHeader className="flex justify-center">
          <div className="flex flex-col items-center">
            <p className="text-md">Current Joke ({jokes.length > 0 ? currentJokeIndex + 1 : 0}/{jokes.length}) </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          {currentJokeIndex >= 0 ? (
            <div>
              <Textarea
                label="Setup"
                placeholder="Enter setup"
                className="mb-2"
                value={editSetup}
                onChange={(e) => setEditSetup(e.target.value)}
              />
              <Textarea
                label="Punchline"
                placeholder="Enter punchline"
                className="mb-4"
                value={editPunchline}
                onChange={(e) => setEditPunchline(e.target.value)}
              />
              <div>
                <div className="flex justify-between">
                  <button
                    className="bg-green text-white rounded-2xl px-4 py-2"
                    onClick={saveEditedJoke}
                  >
                    Save
                  </button>
                  <button
                    className="bg-red text-white rounded-2xl px-4 py-2"
                    onClick={() => removeJoke(jokes[currentJokeIndex])}
                  >
                    Remove Joke
                  </button>
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    className={`text-white rounded-2xl px-4 py-2 mt-4 w-full ${!favorites.some(joke => joke.id === jokes[currentJokeIndex].id) ? 'bg-green' : 'bg-gray-300 cursor-not-allowed'}`}
                    onClick={addToFavorites}
                    disabled={favorites.some(joke => joke.id === jokes[currentJokeIndex].id)}
                  >
                    Add to Favorites
                  </button>
                </div>
              </div>
            </div>
          ) :
            <p className="text-md">Click the button to get a joke</p>
          }
        </CardBody>
      </Card>
      <div className="flex space-x-4">
        <button className={`bg-blue text-white rounded-2xl px-4 py-2 mb-4 ${currentJokeIndex <= 0 ? 'bg-gray-300 cursor-not-allowed' : ''}`} onClick={handlePrevious} disabled={currentJokeIndex <= 0}>
          Previous
        </button>
        <button className={`bg-blue text-white rounded-2xl px-4 py-2 mb-4 ${currentJokeIndex >= jokes.length - 1 ? 'bg-gray-300 cursor-not-allowed' : ''}`} onClick={handleNext} disabled={currentJokeIndex >= jokes.length - 1}>
          Next
        </button>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Favorite Jokes</h2>
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {favorites.map((favorite, index) => (
              <Card key={index} className="border-2 border-gray-300 rounded-lg p-2">
                <CardBody>
                  <p className="text-lg">{favorite.setup}</p>

                  <p className="text-lg">{favorite.punchline}</p>
                  <button
                    className="bg-red text-white rounded-2xl px-4 py-2 mt-4"
                    onClick={() => removeFromFavorites(favorite)}
                  >
                    Remove from Favorites
                  </button>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-md">No jokes added to favorites yet.</p>
        )}
      </div>

    </main>
  );
}
