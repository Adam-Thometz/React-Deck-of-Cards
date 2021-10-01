import React, {useState, useEffect, useRef} from "react";
import axios from "axios";
import Card from "./Card";

const API_URL = 'http://deckofcardsapi.com/api/deck'

const CardWrapper = () => {
  const [deck, setDeck] = useState(null)
  const [drawn, setDrawn] = useState([])
  const [autoDraw, setAutoDraw] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    async function shuffleDeck() {
      const deckRes = await axios.get(`${API_URL}/new/shuffle`)
      setDeck(deckRes.data)
    }
    shuffleDeck()
  }, [])

  useEffect(() => {
    async function drawCard() {
      const {deck_id} = deck
      
      try {
        const cardRes = await axios.get(`${API_URL}/${deck_id}/draw/`)
        if (cardRes.data.remaining === 0) {
          setAutoDraw(false)
          throw new Error('no cards left!')
        }
        const card = cardRes.data.cards[0]
  
        setDrawn(d => [
          ...d,
          {
            id: card.code,
            name: `${card.value} of ${card.suit}`,
            image: card.image
          }
        ])
      } catch (err) {
        alert(err)
      }
    }
    
    if (autoDraw && !timerRef.current) {
      timerRef.current = setInterval(async () => {
        await drawCard()
      }, 1000)
    }

    return () => {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [autoDraw, setAutoDraw, deck])

  const toggleAuto = () => {
    setAutoDraw(auto => !auto)
  }

  const cards = drawn.map(c => (
    <Card key={c.id} name={c.name} image={c.image} />
  ))
  return (
    <div>
      {deck ? (
        <button onClick={toggleAuto}>
          {autoDraw ? "Stop" : "Start"} drawing cards for me!
        </button>
        ) : null}
      <div>
        {cards}
      </div>
    </div>
    
  )
}

export default CardWrapper