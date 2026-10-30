globalThis.CP_CURRICULUM = [
  {
    id: "rules",
    title: "The Rules",
    level: "Never played before",
    blurb:
      "How every piece moves, how to win, and the special rules. About 30 minutes.",
    lessons: [
      {
        id: "board",
        title: "The board",
        summary: "Files, ranks and square names",
        steps: [
          {
            type: "text",
            fen: "8/8/8/8/8/8/8/8 w - - 0 1",
            marks: ["e4"],
            text: "Chess is played on an 8×8 board of light and dark squares. The columns are called **files** and are lettered **a** to **h**. The rows are called **ranks** and are numbered **1** to **8**.\n\nEvery square has a name: its file, then its rank. The highlighted square is **e4**.",
          },
          {
            type: "find",
            fen: "8/8/8/8/8/8/8/8 w - - 0 1",
            squares: ["e4"],
            text: "Click the square **e4**.",
          },
          {
            type: "find",
            fen: "8/8/8/8/8/8/8/8 w - - 0 1",
            squares: ["d5"],
            text: "Now click **d5**.",
          },
          {
            type: "find",
            fen: "8/8/8/8/8/8/8/8 w - - 0 1",
            squares: ["a1", "h8"],
            text: "Click both corner squares **a1** and **h8**. Notice that a1 is dark and h8 is dark too: the long diagonal joins them.",
          },
          {
            type: "text",
            text: "This is how a game starts. White always moves first.\n\n- Rooks go in the corners, then knights, then bishops.\n- The queen stands on her own colour: White’s queen on the light square d1, Black’s on the dark square d8.\n- The king takes the last square, e1 or e8.\n- A row of pawns stands in front.\n\nTip: when setting up a real board, each player has a **light square in the right-hand corner**.",
          },
        ],
      },
      {
        id: "rook",
        title: "The rook",
        summary: "Straight lines · worth 5",
        steps: [
          {
            type: "text",
            fen: "8/8/8/8/3R4/8/8/8 w - - 0 1",
            arrows: ["d4d8", "d4d1", "d4a4", "d4h4"],
            text: "The **rook** moves any number of squares in a straight line: up, down, left or right. It cannot jump over pieces.\n\nPieces capture by moving onto an enemy piece’s square and removing it. A rook is worth about **5 points**.",
          },
          {
            type: "move",
            fen: "8/8/8/3p4/8/8/8/3R4 w - - 0 1",
            solution: ["Rxd5"],
            text: "Capture the black pawn with your rook.",
          },
          {
            type: "move",
            fen: "8/8/1p6/8/8/1P6/8/1R4n1 w - - 0 1",
            solution: ["Rxg1"],
            text: "Your own pawn blocks the rook’s path up the b-file. Find another way: capture the knight.",
          },
        ],
      },
      {
        id: "bishop",
        title: "The bishop",
        summary: "Diagonals · worth 3",
        steps: [
          {
            type: "text",
            fen: "8/8/8/8/3B4/8/8/8 w - - 0 1",
            arrows: ["d4a7", "d4h8", "d4a1", "d4g1"],
            text: "The **bishop** moves any number of squares diagonally. A bishop stays on its starting colour for the whole game, so each side has one “light-squared” and one “dark-squared” bishop. Worth about **3 points**.",
          },
          {
            type: "move",
            fen: "8/8/8/6n1/8/8/8/2B5 w - - 0 1",
            solution: ["Bxg5"],
            text: "Capture the knight with your bishop.",
          },
        ],
      },
      {
        id: "queen",
        title: "The queen",
        summary: "Rook + bishop · worth 9",
        steps: [
          {
            type: "text",
            fen: "8/8/8/8/3Q4/8/8/8 w - - 0 1",
            arrows: [
              "d4d8",
              "d4d1",
              "d4a4",
              "d4h4",
              "d4a7",
              "d4h8",
              "d4a1",
              "d4g1",
            ],
            text: "The **queen** moves like a rook *and* a bishop: any distance in any straight line. She is the strongest piece, worth about **9 points**. Treat her carefully!",
          },
          {
            type: "move",
            fen: "8/8/8/7r/8/8/8/3Q4 w - - 0 1",
            solution: ["Qxh5"],
            text: "Capture the rook with your queen.",
          },
        ],
      },
      {
        id: "knight",
        title: "The knight",
        summary: "The L-shape · the only jumper",
        steps: [
          {
            type: "text",
            fen: "8/8/8/8/3N4/8/8/8 w - - 0 1",
            arrows: [
              "d4c6",
              "d4e6",
              "d4f5",
              "d4f3",
              "d4e2",
              "d4c2",
              "d4b3",
              "d4b5",
            ],
            text: "The **knight** moves in an **L**: two squares in one direction, then one square to the side. It is the only piece that can **jump over** other pieces. A knight always lands on a square of the opposite colour. Worth about **3 points**.",
          },
          {
            type: "move",
            fen: "8/8/8/8/8/5b2/8/6N1 w - - 0 1",
            solution: ["Nxf3"],
            text: "Capture the bishop with your knight.",
          },
          {
            type: "move",
            fen: "8/8/8/8/8/r7/PPP5/RN6 w - - 0 1",
            solution: ["Nxa3"],
            text: "Your knight is surrounded by its own pieces, but knights jump. Capture the rook.",
          },
        ],
      },
      {
        id: "king",
        title: "The king",
        summary: "One step · the piece you must protect",
        steps: [
          {
            type: "text",
            fen: "8/8/8/8/3K4/8/8/8 w - - 0 1",
            arrows: [
              "d4d5",
              "d4e5",
              "d4e4",
              "d4e3",
              "d4d3",
              "d4c3",
              "d4c4",
              "d4c5",
            ],
            text: "The **king** moves one square in any direction. It is the most important piece: lose it and you lose the game. The king can never move onto a square where it could be captured.\n\nIn the endgame, when few pieces are left, the king becomes a strong fighter.",
          },
          {
            type: "move",
            fen: "8/8/8/8/8/8/4p3/4K3 w - - 0 1",
            solution: ["Kxe2"],
            text: "That black pawn is about to reach the end of the board. Stop it: capture it with your king.",
          },
        ],
      },
      {
        id: "pawn",
        title: "The pawn",
        summary: "Forward one, captures diagonally",
        steps: [
          {
            type: "text",
            fen: "8/8/8/8/8/8/4P3/8 w - - 0 1",
            arrows: ["e2e3", "e2e4"],
            text: "The **pawn** moves straight forward one square. On its very first move it may go **two** squares. Pawns never move backwards. Worth **1 point**, but pawns decide many games.",
          },
          {
            type: "move",
            fen: "8/8/8/3p4/4P3/8/8/8 w - - 0 1",
            solution: ["exd5"],
            text: "Pawns **capture diagonally forward**, one square. They cannot capture straight ahead. Capture the black pawn.",
          },
          {
            type: "move",
            fen: "8/3P4/8/8/8/8/8/8 w - - 0 1",
            solution: ["d8=Q"],
            text: "A pawn that reaches the far end of the board is **promoted**: it becomes a queen, rook, bishop or knight. Almost always you choose a queen. Push the pawn and make a queen.",
          },
        ],
      },
      {
        id: "check",
        title: "Check and checkmate",
        summary: "How games are won",
        steps: [
          {
            type: "text",
            fen: "4k3/8/8/8/8/8/8/4R1K1 b - - 0 1",
            arrows: ["e1e8"],
            text: "When a king is attacked it is in **check**. The player in check *must* get out of it at once, in one of three ways:\n\n1. **Move** the king to a safe square.\n2. **Block** the attack with another piece.\n3. **Capture** the attacking piece.\n\nHere the white rook gives check. Black’s king can step aside.",
          },
          {
            type: "move",
            fen: "4k3/8/8/8/8/8/3q4/4K3 w - - 0 1",
            solution: ["Kxd2"],
            text: "Your king is in check from the queen. Nothing protects her. Get out of check by capturing her.",
          },
          {
            type: "move",
            fen: "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1",
            solution: ["Ra8#"],
            text: "If a king is in check and there is **no way out**, that is **checkmate** and the game is over.\n\nBlack’s own pawns trap the king. Deliver checkmate.",
            success:
              "Checkmate! This is the famous **back-rank mate**. Remember it: it wins (and loses) countless games.",
          },
        ],
      },
      {
        id: "special",
        title: "Special moves",
        summary: "Castling and en passant",
        steps: [
          {
            type: "text",
            fen: "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1",
            arrows: ["e1g1", "h1f1"],
            text: "**Castling** moves the king two squares towards a rook, and the rook hops over to the other side of the king. It is the only move where two pieces move at once. It tucks the king into safety and brings the rook into play.\n\nYou may castle only if:\n- neither the king nor that rook has moved yet,\n- the squares between them are empty,\n- the king is not in check, and does not pass through or land on an attacked square.",
          },
          {
            type: "move",
            fen: "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1",
            solution: ["O-O"],
            text: "Castle on the kingside: move your king two squares to the right (to g1).",
          },
          {
            type: "move",
            fen: "k7/8/8/3pP3/8/8/8/K7 w - d6 0 1",
            solution: ["exd6"],
            text: "**En passant** (“in passing”): Black’s pawn has just jumped two squares from d7 to d5, landing beside your pawn. On this move only, you may capture it as if it had moved one square. Your pawn goes to d6.",
          },
        ],
      },
      {
        id: "draws",
        title: "Draws",
        summary: "Stalemate and other draws",
        steps: [
          {
            type: "text",
            fen: "k7/2Q5/1K6/8/8/8/8/8 b - - 0 1",
            text: "Black to move. Black is **not** in check, but has no legal move. That is **stalemate**, and stalemate is a **draw**, even though White is a queen ahead!\n\nGames are also drawn by:\n- **agreement** between the players,\n- **threefold repetition** of the same position,\n- the **50-move rule** (50 moves each with no capture and no pawn move),\n- **insufficient material** (for example king against king, or king and bishop against king).",
          },
          {
            type: "move",
            fen: "k7/8/1K6/8/8/8/8/2Q5 w - - 0 1",
            solution: ["Qc8#"],
            text: "Checkmate in one. Careful: one wrong queen move gives stalemate.",
            success:
              "Checkmate! Whenever you are winning easily, check that your opponent still has a move.",
          },
        ],
      },
    ],
  },

  {
    id: "beginner",
    title: "First Wins",
    level: "Knows the rules · up to ~800",
    blurb: "Stop losing pieces, mate a lone king, and play a sensible opening.",
    lessons: [
      {
        id: "values",
        title: "Counting material",
        summary: "Pawn 1 · knight 3 · bishop 3 · rook 5 · queen 9",
        steps: [
          {
            type: "text",
            text: "Before you capture, and before you leave a piece somewhere, **count**. The usual values are:\n\n- Pawn **1**\n- Knight **3**, Bishop **3**\n- Rook **5**\n- Queen **9**\n- King: priceless\n\nTrading a bishop for a rook (“winning the exchange”) gains 2 points. Giving a queen for a rook loses 4. These numbers are guides, not laws, but at this stage they are your best friend.",
          },
          {
            type: "move",
            line: "1. e4 e5 2. Nf3 Qh4",
            solution: ["Nxh4"],
            text: "Black’s queen has wandered out. Is it safe? Count the attackers.",
            success:
              "You won the queen for nothing. A piece that can be captured for free is called **hanging**.",
          },
        ],
      },
      {
        id: "hanging",
        title: "Look before you leap",
        summary: "Free pieces and a famous opening mistake",
        steps: [
          {
            type: "text",
            text: "Most games between beginners are decided by **hanging pieces**. Build one habit now. Before every move ask:\n\n1. What did my opponent’s last move attack?\n2. After my move, can any of my pieces be captured for free?\n\nIt takes five seconds and it will save hundreds of games.",
          },
          {
            type: "move",
            line: "1. e4 e5 2. Nf3 f6 3. Nxe5 fxe5",
            solution: ["Qh5+", "g6", "Qxe5+"],
            text: "Black defended the e5 pawn with 2…f6, a weakening move, and then grabbed White’s knight. Punish it: start with a check that exposes the black king.",
            hint: "The queen can check from h5.",
            success:
              "Your queen attacks the king **and** the rook on h8 at once. Black loses the rook. This is why weakening pawn moves near the king are dangerous.",
          },
        ],
      },
      {
        id: "mate-queen",
        title: "Checkmate with the queen",
        summary: "King and queen against king",
        steps: [
          {
            type: "text",
            fen: "8/8/8/4k3/8/8/8/4K2Q w - - 0 1",
            text: "King and queen against a lone king is always a win, and you must be able to do it in your sleep.\n\n**The method:**\n1. Use the queen to shrink the king’s **box**. Move a knight’s jump away from the enemy king, so the box gets smaller each time.\n2. When the king is stuck on the edge, **stop** and bring your own king up.\n3. Deliver mate with the queen, protected by your king.\n\n⚠ The danger is **stalemate**: when the enemy king is short of squares, always check it still has a move.",
          },
          {
            type: "move",
            fen: "3k4/8/3K4/8/8/8/8/7Q w - - 0 1",
            solution: ["Qh8#"],
            text: "The king is on the edge and your king is in front of it. Finish it.",
          },
          {
            type: "play",
            fen: "8/8/8/4k3/8/8/8/4K2Q w - - 0 1",
            goal: "mate",
            level: 7,
            text: "Now do it against the computer. You have 50 moves. A good time is under 10.",
          },
        ],
      },
      {
        id: "mate-rook",
        title: "Checkmate with the rook",
        summary: "King and rook against king",
        steps: [
          {
            type: "text",
            fen: "8/8/8/4k3/8/8/8/4K2R w - - 0 1",
            text: "King and rook against king is also a forced win, but the rook needs the king’s help much earlier.\n\n**The method:**\n1. Use the rook to cut the enemy king off on one side.\n2. Walk your king towards it.\n3. When the kings stand **opposite** each other (with one square between), check with the rook to push the king back a rank.\n4. If the kings are not opposite, make a waiting rook move, or approach with your king.\n5. Repeat until mate on the edge.",
          },
          {
            type: "move",
            fen: "7k/R7/8/8/8/8/8/1R4K1 w - - 0 1",
            solution: ["Rb8#"],
            text: "First the easy version with two rooks: the **ladder** (or “lawnmower”) mate. One rook guards the 7th rank. Mate with the other.",
          },
          {
            type: "play",
            fen: "8/8/8/4k3/8/8/8/4K2R w - - 0 1",
            goal: "mate",
            level: 7,
            text: "Now king and rook against the computer. Remember: kings opposite, then check.",
          },
        ],
      },
      {
        id: "opening-principles",
        title: "Opening principles",
        summary: "Centre, develop, castle",
        steps: [
          {
            type: "text",
            text: "You do not need to memorise openings yet. Follow these principles and you will get a good position nearly every time:\n\n1. **Fight for the centre** (e4, d4, e5, d5) with pawns and pieces.\n2. **Develop** knights and bishops quickly, usually knights first.\n3. **Castle** early to keep your king safe.\n4. Don’t move the same piece twice without a reason, and don’t bring the queen out early.\n5. **Connect your rooks** (clear the back rank) and put them on open files.",
          },
          {
            type: "move",
            solution: ["e4"],
            accept: ["d4", "c4", "Nf3"],
            text: "Play a good first move.",
            success:
              "Good: that move claims central squares and opens lines for your pieces.",
          },
          {
            type: "move",
            line: "1. e4 e5",
            solution: ["Nf3"],
            accept: ["Nc3", "Bc4"],
            text: "Develop a piece. Bonus points if it attacks something.",
            success:
              "Developing with a threat (Nf3 hits e5) is the best kind of development.",
          },
          {
            type: "move",
            line: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5",
            solution: ["O-O"],
            text: "Your pieces are out. What should the king do?",
          },
        ],
      },
      {
        id: "scholars",
        title: "Scholar’s mate",
        summary: "The four-move checkmate, and how to stop it",
        steps: [
          {
            type: "move",
            line: "1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6",
            solution: ["Qxf7#"],
            text: "Queen and bishop both aim at **f7**, the weakest square in Black’s camp: only the king defends it. Black just played 3…Nf6??, attacking the queen. Punish it.",
          },
          {
            type: "move",
            line: "1. e4 e5 2. Bc4 Nc6 3. Qh5",
            solution: ["g6"],
            accept: ["Qe7", "Qf6"],
            text: "Now you are Black and White is trying the same trick. Defend f7 (and keep e5 protected).",
            success:
              "Defended. After 3…g6 White’s queen must move again, so Black gains time. An early queen attack is easy to meet once you know it.",
          },
        ],
      },
      {
        id: "forks",
        title: "Forks",
        summary: "One piece, two targets",
        steps: [
          {
            type: "text",
            text: "A **fork** is one piece attacking two (or more) things at once. Your opponent can usually only save one.\n\nAny piece can fork, but the **knight** is the master: its jumps are hard to see coming. The most valuable fork includes a **check**, because the king must answer first.",
          },
          {
            type: "move",
            fen: "r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1",
            solution: ["Nc7+", "Kd7", "Nxa8"],
            text: "Win the rook with a knight fork.",
          },
          {
            type: "move",
            fen: "k7/8/2n1r3/8/3P4/8/8/K7 w - - 0 1",
            solution: ["d5"],
            text: "Even a pawn can fork. Attack two pieces at once.",
          },
          {
            type: "move",
            fen: "r5k1/6pp/8/8/8/8/5PPP/3Q2K1 w - - 0 1",
            solution: ["Qd5+", "Kh8", "Qxa8#"],
            text: "Find the queen check that also hits the rook.",
          },
        ],
      },
      {
        id: "pins",
        title: "Pins and skewers",
        summary: "Attacking through a piece",
        steps: [
          {
            type: "text",
            fen: "4k3/8/2n5/1B6/8/8/8/4K3 w - - 0 1",
            arrows: ["b5e8"],
            text: "A **pin**: the knight cannot move, because that would expose its king to the bishop. A pin against the king is *absolute* (moving is illegal); against another piece it is *relative* (moving is legal but costly).\n\nPinned pieces are sitting ducks. **Attack them again**.",
          },
          {
            type: "move",
            fen: "4k3/8/2n5/1B6/3P4/8/8/4K3 w - - 0 1",
            solution: ["d5"],
            text: "The knight is pinned. Attack it with something cheaper.",
          },
          {
            type: "move",
            fen: "1q6/8/8/4k3/8/8/8/K5B1 w - - 0 1",
            solution: ["Bh2+", "Kd5", "Bxb8"],
            text: "A **skewer** is a pin in reverse: attack the valuable piece in front, and when it moves, take what is behind. Skewer the king and queen.",
          },
        ],
      },
      {
        id: "back-rank",
        title: "Back-rank danger",
        summary: "Give your king air",
        steps: [
          {
            type: "move",
            fen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
            solution: ["Rd8#"],
            text: "A quick reminder. Mate in one.",
          },
          {
            type: "move",
            fen: "3r2k1/5ppp/8/8/8/8/3R1PPP/3R2K1 w - - 0 1",
            solution: ["Rxd8#"],
            text: "Black guards the back rank with one rook, but you have two. When attackers outnumber defenders, the defence breaks.",
          },
          {
            type: "text",
            fen: "6k1/5pp1/7p/8/8/7P/5PP1/6K1 w - - 0 1",
            marks: ["h7", "h2"],
            text: "The cure is simple: once the opening is over and you have a quiet moment, give your king **luft** (“air”) with a pawn move like h3 or h6. Then a check on the back rank is no longer mate.",
          },
        ],
      },
      {
        id: "cct",
        title: "Checks, captures, threats",
        summary: "Your first thinking routine",
        steps: [
          {
            type: "text",
            text: "Strong players do not find tactics by luck. On every move they scan the **forcing moves** first, in this order:\n\n1. **Checks**: every check, even silly-looking ones.\n2. **Captures**: every capture.\n3. **Threats**: moves that attack something.\n\nForcing moves limit your opponent’s replies, so you can calculate them. Do the same scan for your opponent’s forcing moves before you commit.",
          },
          {
            type: "move",
            fen: "6k1/5ppp/8/8/8/8/1q3PPP/3R2K1 w - - 0 1",
            solution: ["Rd8#"],
            text: "Black’s queen has invaded. You might be tempted to defend… but scan for checks first.",
            success:
              "Checks first! The queen raid does not matter if the game is over.",
          },
        ],
      },
    ],
  },

  {
    id: "improver",
    title: "Tactics Toolkit",
    level: "~800 to 1200",
    blurb:
      "The tactical patterns that decide most games below master level, plus your first endgame rules.",
    lessons: [
      {
        id: "discovered",
        title: "Discovered attacks",
        summary: "Move one piece, unleash another",
        steps: [
          {
            type: "text",
            fen: "4k3/7q/8/8/4B3/8/8/4R1K1 w - - 0 1",
            arrows: ["e1e8", "e4h7"],
            text: "A **discovered attack** happens when a piece moves out of the way and uncovers an attack by the piece behind it. The moving piece is free to create a second threat. If the uncovered attack is a check, it is a **discovered check**, and the moving piece can go almost anywhere.",
          },
          {
            type: "move",
            fen: "4k3/7q/8/8/4B3/8/8/4R1K1 w - - 0 1",
            solution: ["Bxh7+"],
            text: "Use a discovered check to win the queen.",
          },
          {
            type: "move",
            fen: "3qkb2/5p2/8/8/4B3/8/8/4R1K1 w - - 0 1",
            solution: ["Bc6#"],
            text: "A **double check** is the strongest discovered attack: both pieces give check. You cannot block two lines or capture two pieces, so **the king must move**. Here it cannot. Find the mate.",
          },
        ],
      },
      {
        id: "overload",
        title: "Overloading and deflection",
        summary: "One defender, two jobs",
        steps: [
          {
            type: "text",
            text: "Look at what each enemy piece is **defending**. A piece with two jobs is **overloaded**: make it do one, and the other falls.\n\n**Deflection** is the same idea from your side: you force a defender (often with a sacrifice) away from the square it guards.",
          },
          {
            type: "move",
            fen: "3r2k1/5ppp/3b4/8/8/8/5PPP/3RR1K1 w - - 0 1",
            solution: ["Rxd6", "Rxd6", "Re8#"],
            text: "Black’s rook on d8 guards the back rank **and** the bishop. It cannot do both. (Careful: White’s own back rank is weak too, so pick the right order.)",
          },
        ],
      },
      {
        id: "mating-patterns",
        title: "Mating patterns",
        summary: "Smothered, Anastasia, Arabian, Boden",
        steps: [
          {
            type: "text",
            text: "Strong players recognise mating nets at a glance because they have seen them hundreds of times. Learn each of these patterns by name, and look for them in your own games.",
          },
          {
            type: "move",
            fen: "6rk/6pp/8/6N1/8/8/8/7K w - - 0 1",
            solution: ["Nf7#"],
            text: "**Smothered mate**: the king is buried by its own pieces and a knight finishes it.",
          },
          {
            type: "move",
            fen: "8/4N1pk/8/8/8/3R4/8/6K1 w - - 0 1",
            solution: ["Rh3#"],
            text: "**Anastasia’s mate**: a knight on e7 takes away g6 and g8, and a rook mates along the h-file.",
          },
          {
            type: "move",
            fen: "7k/1R6/5N2/8/8/8/8/6K1 w - - 0 1",
            solution: ["Rh7#"],
            text: "**Arabian mate**: rook and knight against a cornered king. The knight both covers g8 and protects the rook.",
          },
          {
            type: "move",
            fen: "2kr4/p2n4/2p5/8/5B2/8/4B3/6K1 w - - 0 1",
            solution: ["Ba6#"],
            text: "**Boden’s mate**: two bishops on criss-crossing diagonals against a castled-queenside king.",
          },
          {
            type: "move",
            line: "1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Nd7 5. Qe2 Ngf6",
            solution: ["Nd6#"],
            text: "A real opening trap from the Caro-Kann. Black’s last move was a blunder. Find the smothered mate, and notice why the e7-pawn cannot capture.",
            success:
              "The e7-pawn is **pinned** by the queen on e2, so it cannot take on d6. Patterns combine!",
          },
        ],
      },
      {
        id: "square-opposition",
        title: "King and pawn basics",
        summary: "Rule of the square, opposition, key squares",
        steps: [
          {
            type: "text",
            fen: "k7/8/8/p7/8/8/8/5K2 w - - 0 1",
            marks: ["a5", "e5", "a1", "e1"],
            text: "**The rule of the square.** Can a king catch a passed pawn? Draw a square from the pawn to its promotion rank (here a5–e5–e1–a1). If the king can step **inside** the square on its move, it catches the pawn. If not, the pawn promotes.",
          },
          {
            type: "move",
            fen: "k7/8/8/p7/8/8/8/5K2 w - - 0 1",
            solution: ["Ke2"],
            accept: ["Ke1"],
            text: "White to move. Step into the square and catch the pawn.",
          },
          {
            type: "text",
            fen: "8/8/4k3/8/4K3/8/8/8 w - - 0 1",
            arrows: ["e4e6"],
            text: "**Opposition.** When two kings face each other with one square between, the side that does **not** have to move “has the opposition”. The other king must give way.\n\n**Key squares.** For a pawn on its 2nd–4th rank, the key squares are the three squares **two ranks in front** of it. If the attacking king reaches a key square, the pawn promotes, whatever the defender does.\n\nFor a pawn on e2, the key squares are d4, e4 and f4.",
          },
          {
            type: "play",
            fen: "8/8/4k3/8/8/4K3/4P3/8 w - - 0 1",
            goal: "promote",
            level: 7,
            text: "Win this against the computer. Head for a key square **before** pushing the pawn, and keep your king in front of it.",
          },
        ],
      },
      {
        id: "legal",
        title: "Calculating a combination",
        summary: "Légal’s mate",
        steps: [
          {
            type: "text",
            text: "A **combination** is a forcing sequence, often with a sacrifice, that leads to a concrete gain. To play one you must **calculate**: picture the moves in your head and judge the final position.\n\nStart with forcing moves, check each of the opponent’s replies, and only stop when the position is quiet.",
          },
          {
            type: "move",
            line: "1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 g6",
            solution: ["Nxe5", "Bxd1", "Bxf7+", "Ke7", "Nd5#"],
            text: "Black’s bishop pins your knight to your queen. Ignore the pin! Sacrifice the queen and mate with your minor pieces.",
            hint: "The knight on f3 is not truly pinned: the queen is not the king.",
            success:
              "**Légal’s mate**, first seen in the 1750s. A pin against the queen is only *relative*.",
          },
        ],
      },
      {
        id: "threats",
        title: "What does your opponent want?",
        summary: "Defence and the opponent’s threats",
        steps: [
          {
            type: "text",
            text: "Half of chess is defence. After every enemy move, ask: **what does it threaten?** Imagine it were your opponent’s move again: what would they do?\n\nIf there is a threat, look for the most active way to meet it: a counter-threat, a trade, or a move that defends and develops at the same time.",
          },
          {
            type: "move",
            line: "1. e4 e5 2. Nf3 Nf6 3. Nxe5 Nxe4 4. Qe2",
            solution: ["Qe7"],
            text: "You are Black. You copied White with 3…Nxe4, and now 4.Qe2 attacks your knight. But there is a nastier threat hidden in the position. Find the move that meets everything.",
            wrong:
              "Careful: if your knight leaves e4, White plays **Nc6+**: a discovered check from the queen that also attacks your queen.",
            success:
              "Correct. 4…Qe7 blocks the e-file, so there is no discovered check. After 5.Qxe4 d6 Black wins the knight back.",
          },
        ],
      },
    ],
  },

  {
    id: "club",
    title: "Club Player",
    level: "~1200 to 1600",
    blurb:
      "Think in plans, build an opening repertoire, understand pawn structure, and learn the two most important rook endings.",
    lessons: [
      {
        id: "thinking",
        title: "A thinking process",
        summary: "What to do on every move",
        steps: [
          {
            type: "text",
            text: "In a slow game, use the same routine on every move until it becomes automatic:\n\n1. **What changed?** What does the opponent’s last move attack, defend, or prepare?\n2. **Forcing moves** for both sides: checks, captures, threats.\n3. **Evaluate**: material, king safety, piece activity, pawn structure. Who is better, and why?\n4. **Plan**: which part of the board should I play on? Which is my worst piece?\n5. **Candidate moves**: list two or three, then calculate each.\n6. **Blunder check**: before touching a piece, look once more at every check and capture your opponent would have.",
          },
          {
            type: "text",
            text: "**Time management.** Spend your time where the game is decided: on critical moments (tactics in the air, pawn breaks, trades that change the character of the game). Play “obvious” moves (recaptures, natural development) quickly.\n\n**After the game**, before you switch on an engine, write down what you thought during the game. Then compare. This gap between what you saw and what was true is exactly what you need to train.",
          },
        ],
      },
      {
        id: "repertoire",
        title: "Building an opening repertoire",
        summary: "Few lines, understood deeply",
        steps: [
          {
            type: "text",
            line: "1. e4 e5 2. Nf3 Nc6 3. Bc4",
            text: "Pick **one** answer to each main try and stick with it for a year. Understand the **plans and pawn structures**, not just the moves.\n\n**As White, a simple start: 1.e4 and the Italian Game** (shown). Quick development, castle, then play c3 and d4 for the centre, or a slow d3 build-up.",
          },
          {
            type: "move",
            line: "1. e4 e5 2. Nf3 Nc6",
            solution: ["Bc4"],
            accept: ["Bb5", "d4", "Nc3"],
            text: "Develop your light-squared bishop to an active diagonal.",
          },
          {
            type: "text",
            line: "1. d4 d5 2. c4 e6 3. Nc3 Nf6",
            text: "**Against 1.d4, the Queen’s Gambit Declined** (shown) is rock solid: Black holds d5, develops calmly, and later frees the position with …c5 or …e5.\n\n**Against 1.e4**, 1…e5 (open games) and 1…c6 (the Caro-Kann) are both solid choices that teach good classical habits. The Sicilian (1…c5) is the most combative, but needs much more theory.",
          },
          {
            type: "text",
            text: "**How to study openings:**\n- Learn the first 6–10 moves of your lines, and the **idea** behind every move.\n- Know the typical **pawn structure** you get and the plans that go with it.\n- Learn the traps in your lines, for both sides.\n- After every game, find the move where you left your preparation and look up the right continuation. Your repertoire grows from your own games.",
          },
        ],
      },
      {
        id: "pawn-structure",
        title: "Pawn structure",
        summary: "Isolated, doubled, backward and passed pawns",
        steps: [
          {
            type: "text",
            text: "Pawns cannot move backwards, so pawn moves create **permanent** features. The pawn structure tells you where to play.\n\n- **Isolated pawn**: no friendly pawns on the files beside it, so no pawn can defend it.\n- **Doubled pawns**: two pawns on the same file.\n- **Backward pawn**: a pawn left behind its neighbours that cannot safely advance.\n- **Passed pawn**: no enemy pawn in front of it or on the files beside it. It can run to promotion.",
          },
          {
            type: "text",
            line: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Bxc6 dxc6",
            marks: ["c7", "c6"],
            text: "**Doubled pawns** are not always bad. Here Black has doubled c-pawns, but in return gets the **bishop pair** and open lines. White hopes to reach an endgame, where the kingside pawn majority can make a passed pawn and Black’s queenside majority cannot.",
          },
          {
            type: "text",
            line: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e5 6. Ndb5 d6 7. Bg5 a6 8. Na3 b5",
            marks: ["d6", "d5"],
            text: "**A backward pawn and a hole.** In this Sicilian, Black’s d6-pawn is backward, and **d5** can never be attacked by a black pawn again. White will fight to plant a piece on d5. Black accepts this in exchange for activity and the bishop pair.",
          },
          {
            type: "text",
            fen: "8/5k2/8/1P6/8/8/5K2/8 w - - 0 1",
            marks: ["b5"],
            text: "**Passed pawns must be pushed.** In the endgame a passed pawn ties down enemy pieces, which must keep blocking it. Here the black king has to run to the queenside, and White’s king will feast elsewhere.",
          },
        ],
      },
      {
        id: "activity",
        title: "Piece activity",
        summary: "Outposts, open files, the seventh rank",
        steps: [
          {
            type: "text",
            line: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e5 6. Ndb5 d6 7. Bg5 a6 8. Na3 b5 9. Bxf6 gxf6 10. Nd5",
            marks: ["d5"],
            text: "**Outposts.** A square that enemy pawns can no longer attack, ideally supported by your own pawn, is an outpost. A knight on an outpost in the centre can be as strong as a rook. Here the d5 knight dominates the board.",
          },
          {
            type: "text",
            line: "1. e4 e6 2. d4 d5 3. e5 c5 4. c3 Nc6 5. Nf3",
            marks: ["c8", "d5", "e6"],
            text: "**Good and bad bishops.** A bishop hemmed in by its own pawns on its colour is “bad”. In this French Defence, Black’s c8-bishop is blocked by the pawns on e6 and d5. Black often spends moves activating it (…Bd7–b5, or …b6 and …Ba6) or trading it.",
          },
          {
            type: "text",
            fen: "6k1/1R3ppp/8/8/8/8/5PPP/6K1 w - - 0 1",
            arrows: ["b7f7"],
            text: "**Rooks need open files**, files with no pawns on them. Put rooks on open files, double them, and invade along the file. A rook on the **seventh rank** attacks pawns that can only be defended sideways, and traps the enemy king on the back rank.",
          },
          {
            type: "text",
            text: "**Improve your worst piece.** When nothing is happening tactically, find your least active piece and find it a better square. This simple rule produces surprisingly strong moves.",
          },
        ],
      },
      {
        id: "lucena",
        title: "The Lucena position",
        summary: "How to win with rook and pawn",
        steps: [
          {
            type: "text",
            fen: "1K6/1P1k4/8/8/8/8/r7/2R5 w - - 0 1",
            text: "Rook endings are the most common endings in chess. Two positions are essential. The first is **Lucena**: your pawn is on the 7th rank, your king is in front of it, and the enemy king is cut off.\n\nThe winning method is called **building a bridge**:\n1. Check the enemy king one file further away: **Rd1+**.\n2. Lift your rook to the **4th rank**: **Rd4!**\n3. Walk your king out. When the enemy rook checks, block the checks with your rook on the 4th rank.",
          },
          {
            type: "play",
            fen: "1K6/1P1k4/8/8/8/8/r7/2R5 w - - 0 1",
            goal: "promote",
            level: 7,
            text: "Win it. Build the bridge and promote the pawn safely.",
          },
        ],
      },
      {
        id: "philidor",
        title: "The Philidor position",
        summary: "How to draw a rook ending a pawn down",
        steps: [
          {
            type: "text",
            fen: "4k3/7R/r7/3KP3/8/8/8/8 b - - 0 1",
            text: "The second essential rook ending is **Philidor**, the defender’s method. Your king stands on the pawn’s promotion square.\n\n1. Keep your rook on your **3rd rank** (here, the 6th), stopping the enemy king from advancing.\n2. The moment the pawn steps onto that rank (here, e6), the king loses its shelter: swing your rook to the **back** (…Ra1) and give checks from behind. The king cannot hide.",
          },
          {
            type: "play",
            fen: "4k3/7R/r7/3KP3/8/8/8/8 b - - 0 1",
            goal: "hold",
            movesToHold: 15,
            level: 7,
            text: "You are Black. Hold the draw for 15 moves using Philidor’s method.",
          },
        ],
      },
      {
        id: "model-opera",
        title: "Model game: the Opera Game",
        summary: "Morphy, Paris 1858: development wins",
        steps: [
          {
            type: "game",
            pgn: '[White "Paul Morphy"]\n[Black "Duke of Brunswick and Count Isouard"]\n1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0',
            text: "Morphy played this game in a box at the Paris opera. It is the clearest lesson in chess on **development, open lines and the initiative**. Step through it with ▶ or the arrow keys.",
            notes: {
              6: "3…Bg4 pins the knight, but Black will soon give up this bishop, handing White a lead in development.",
              9: "Black has traded a developed bishop for a knight. White’s queen is in play with tempo.",
              13: "7.Qb3! hits **f7** and **b7** at once.",
              15: "Morphy could grab b7, but 8.Nc3! simply develops. He wants open lines, not pawns.",
              17: "9.Bg5 pins the f6-knight. Black’s pieces are getting tied up.",
              19: "10.Nxb5! A sacrifice to tear open the position while Black’s king is still in the centre.",
              23: "12.O-O-O: the rook joins the attack with gain of time against the pinned d7-knight. Every white piece is now active.",
              25: "13.Rxd7! Remove the defenders.",
              31: "16.Qb8+!! A queen sacrifice that deflects the knight from d7…",
              33: "17.Rd8#. Count the black pieces that never moved: the f8-bishop and h8-rook. **Lead in development + open lines = attack.**",
            },
          },
        ],
      },
    ],
  },

  {
    id: "advanced",
    title: "Advanced",
    level: "~1600 to 2000",
    blurb:
      "Classical strategy: typical structures and their plans, prophylaxis, the exchange sacrifice, deeper endgames.",
    lessons: [
      {
        id: "iqp",
        title: "The isolated queen’s pawn",
        summary: "Dynamics against structure",
        steps: [
          {
            type: "text",
            line: "1. d4 d5 2. c4 e6 3. Nc3 c5 4. cxd5 exd5 5. Nf3 Nc6 6. g3 Nf6 7. Bg2 Be7 8. O-O O-O 9. dxc5 Bxc5",
            marks: ["d5"],
            text: "The **isolated queen’s pawn** (IQP) is one of the most important structures in chess. Here Black has one on d5 (from the Tarrasch Defence).\n\n**For the side with the IQP:** free piece play, outposts on e4/c4 (or e5/c5 for White), and the d-pawn break. Keep pieces on the board and **attack**, often on the kingside.\n\n**Against the IQP:** blockade the square in front of it (here **d4**) with a piece, ideally a knight; **trade pieces**, because every trade brings the endgame closer, where the pawn is just weak; then pile up on it.",
          },
          {
            type: "text",
            text: "**Rule of thumb:** the IQP side wants to attack in the middlegame, the other side wants to reach an endgame. Ask yourself about every trade: “does this help my plan or theirs?”",
          },
        ],
      },
      {
        id: "carlsbad",
        title: "The Carlsbad structure",
        summary: "The minority attack",
        steps: [
          {
            type: "text",
            line: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. cxd5 exd5 5. Bg5 c6 6. e3 Be7 7. Qc2 Nbd7 8. Bd3 O-O 9. Nf3 Re8 10. O-O Nf8 11. Rab1",
            text: "The Exchange Variation of the Queen’s Gambit gives the **Carlsbad structure**. White plans the **minority attack**: push the b-pawn to b4–b5 and trade it on c6, leaving Black with a weak pawn on c6 (or d5) to attack for the rest of the game. 11.Rab1 prepares b4.\n\nBlack’s counterplay comes on the kingside (…Ne4, …Ng6, …Bd6, sometimes …f5) or by meeting b5 with …c5.",
          },
          {
            type: "text",
            text: "Learning a structure means learning **plans you can reuse**. The Carlsbad comes up from the Queen’s Gambit, the Caro-Kann Exchange and the London System. One structure, many openings. The best way to study it: play through 10–20 master games in the structure and write down the plans each side chose.",
          },
        ],
      },
      {
        id: "bishops",
        title: "Bishops: pairs and opposite colours",
        summary: "When bishops shine",
        steps: [
          {
            type: "text",
            text: "**The bishop pair** is worth about half a pawn in open positions: two bishops cover both colours and can dominate the board. Open the position for them by trading pawns.\n\n**Bishop vs knight:** bishops prefer open boards and pawns on both wings; knights prefer closed positions, outposts, and pawns on one wing.",
          },
          {
            type: "text",
            fen: "8/5k2/3b4/8/1P1K4/3B4/8/8 w - - 0 1",
            text: "**Opposite-coloured bishops** (one bishop on light squares, one on dark) behave in two opposite ways:\n\n- In an **endgame**, they are very drawish. The defender sets up a blockade on squares the other bishop can never attack. Even two extra pawns are often not enough to win.\n- In a **middlegame**, they favour the **attacker**: the defender’s bishop can never oppose the attacking bishop on its colour.",
          },
        ],
      },
      {
        id: "prophylaxis",
        title: "Prophylaxis",
        summary: "Stop the plan before it starts",
        steps: [
          {
            type: "text",
            text: "**Prophylaxis** means anticipating and preventing your opponent’s ideas, before they become threats. Nimzowitsch named it, and Petrosian and Karpov made it an art.\n\nThe question to ask every move: **“If it were my opponent’s turn, what would they play?”** If the answer is a good move, consider spending your move to stop it, especially when you have no urgent plan yourself.",
          },
          {
            type: "text",
            text: "Typical prophylactic moves:\n\n- A pawn move (h3, a4) that takes a key square from an enemy piece.\n- Moving the king off a dangerous diagonal or file *before* it opens (Kh1, Kb1).\n- Overprotecting a key central point so it can never be won.\n- Trading the one enemy piece that drives their plan.\n\nStrong players do this all the time. It explains many “quiet” grandmaster moves that confuse beginners.",
          },
        ],
      },
      {
        id: "exchange-sac",
        title: "The exchange sacrifice",
        summary: "When a rook is worth less than a minor piece",
        steps: [
          {
            type: "text",
            line: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6 6. Be3 Bg7 7. f3 O-O 8. Qd2 Nc6 9. Bc4 Bd7 10. O-O-O Rc8 11. Bb3 Ne5 12. h4 Nc4 13. Bxc4 Rxc4",
            arrows: ["c4c3"],
            text: "Material counting stops working at master level. A rook is “worth 5” only if it has open files. In this Sicilian Dragon, Black is ready for **…Rxc3!**: give up a rook for White’s c3-knight, wreck the pawns in front of White’s king, and win the long diagonal for the g7-bishop.\n\nThe **exchange sacrifice** pays off when it gives you one of: a dominant minor piece, a broken enemy pawn structure, lasting attack, or control of key squares.",
          },
        ],
      },
      {
        id: "pawn-endings-2",
        title: "Pawn endings in depth",
        summary: "Outside passers, triangulation, Réti’s king",
        steps: [
          {
            type: "text",
            text: "King and pawn endings are pure calculation. Every tempo counts, and you can’t trade your way out. Ideas every strong player knows:\n\n- **Outside passed pawn**: a passed pawn far from the other pawns decoys the enemy king, and your king then eats the rest.\n- **Triangulation**: losing a tempo with your king by walking a triangle the enemy king cannot copy, to hand over the move and win the opposition.\n- **Corresponding squares**: the generalisation of opposition, mapping each square of your king to the square the defending king must answer with.\n- **Count tempi**, not pieces: before trading into a pawn ending, count exactly who queens first.",
          },
          {
            type: "move",
            fen: "7K/8/k1P5/7p/8/8/8/8 w - - 0 1",
            solution: ["Kg7", "h4", "Kf6", "h3", "Ke7", "h2", "c7"],
            text: "**Réti’s study (1921).** White to move and **draw**. The black pawn looks unstoppable and the white pawn looks lost. But a king can walk two roads at once.",
            hint: "Head diagonally: towards the h-pawn *and* towards your own pawn.",
            success:
              "The king chases the h-pawn while approaching c6. After …h2 c7, Black must stop the c-pawn, and both promote together. **The diagonal is as short as the straight line.**",
          },
        ],
      },
      {
        id: "vancura",
        title: "Rook endings: active defence",
        summary: "The Vancura and the rook behind the pawn",
        steps: [
          {
            type: "text",
            fen: "R7/6k1/P4r2/8/8/8/8/1K6 b - - 0 1",
            text: "**Rooks belong behind passed pawns**, yours or your opponent’s (Tarrasch’s rule). A rook in front of its own pawn is passive; here White’s rook on a8 is stuck.\n\nThe defender uses the **Vancura position**: the black rook attacks the a6-pawn **from the side**, so the white king can’t hide from checks, and the white rook can’t leave a8. Black’s king stays on g7/h7.",
          },
          {
            type: "play",
            fen: "R7/6k1/P4r2/8/8/8/8/1K6 b - - 0 1",
            goal: "hold",
            movesToHold: 12,
            level: 7,
            text: "You are Black. Hold the draw for 12 moves. Keep your rook attacking the pawn from the side, check the king when it comes close, and keep your king near g7.",
          },
        ],
      },
    ],
  },

  {
    id: "expert",
    title: "Expert & Master",
    level: "~2000 to 2300",
    blurb:
      "Calculation discipline, converting advantages, the initiative, endgame studies.",
    lessons: [
      {
        id: "calculation",
        title: "Calculation discipline",
        summary: "Candidate moves and the tree",
        steps: [
          {
            type: "text",
            text: "Kotov’s classic advice was to list all candidate moves and then examine each branch exactly once. Real calculation is messier, but the core holds:\n\n1. **List candidates first** (including the odd-looking forcing ones) before going deep into any of them.\n2. **Calculate the forcing ones first**: they end fastest.\n3. Look for the opponent’s **best reply**, not the one you hope for.\n4. **Stop at quiet positions** and evaluate them honestly.\n5. **Compare final positions**, then choose.\n6. Before moving, a 10-second **blunder check** of the line’s first move.\n\nTrain this with hard puzzles **without moving the pieces**, writing your full line down before checking.",
          },
          {
            type: "move",
            line: "1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8",
            solution: [
              "Rxd7",
              "Rxd7",
              "Rd1",
              "Qe6",
              "Bxd7+",
              "Nxd7",
              "Qb8+",
              "Nxb8",
              "Rd8#",
            ],
            text: "Morphy’s finish, now as a test. White has sacrificed a knight. Calculate the forced mate to the end before you move: it is **5 moves** deep.",
          },
          {
            type: "move",
            fen: "3r3k/6pp/8/6N1/2Q5/B7/5PPP/6K1 w - - 0 1",
            solution: ["Nf7+", "Kg8", "Nh6+", "Kh8", "Qg8+", "Rxg8", "Nf7#"],
            text: "Mate in 4. The tempting 1.Qg8+? fails to 1…Kxg8. First drive the king back and forth with the knight.",
            success:
              "**Philidor’s legacy**: knight check, double check, queen sacrifice, smothered mate.",
          },
        ],
      },
      {
        id: "conversion",
        title: "Converting an advantage",
        summary: "The principle of two weaknesses",
        steps: [
          {
            type: "text",
            text: "Being better and winning are different skills. Masters convert with a few principles:\n\n- **The principle of two weaknesses**: one weakness can usually be defended. Create a **second** weakness on the other side of the board, and switch between them until the defence breaks.\n- **Do not hurry** (Shereshevsky). When the opponent has no counterplay, improve every piece before the decisive break.\n- **Trade pieces, not pawns**, when ahead in material.\n- **Remove all counterplay first**. Every won game is lost by allowing one active idea.",
          },
          {
            type: "text",
            text: "Exercise: take a won endgame (for example from your own games or a database), set it up on the analysis board, and play it out against the computer at full strength. Repeat until you can convert it every time. This is how grandmasters build technique.",
          },
        ],
      },
      {
        id: "initiative",
        title: "The initiative",
        summary: "Model game: the Immortal Game",
        steps: [
          {
            type: "text",
            text: "The **initiative** is the ability to make threats that your opponent must answer. While they respond, they cannot carry out their own plans. Masters often give up material to **keep** the initiative, because it can be worth more than a pawn, a piece, or even a rook.\n\nThe key judgement: is my **compensation** real (development lead, exposed king, dominant pieces) and **lasting**, or will it vanish in a few moves?",
          },
          {
            type: "game",
            pgn: '[White "Adolf Anderssen"]\n[Black "Lionel Kieseritzky"]\n1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5 8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8 15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2 Na6 21. Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7# 1-0',
            text: "**The Immortal Game**, London 1851. Romantic and unsound, but there is no better show of what the initiative can do.",
            notes: {
              3: "2.f4: the King’s Gambit. White offers a pawn for quick development and the f-file.",
              10: "5…Nf6 develops with tempo. Black chases the white pieces, but pieces chased now will be well placed later.",
              21: "White keeps developing and gaining space while Black’s queen keeps moving.",
              32: "Black has moved the queen many times and the queenside is still undeveloped.",
              33: "17.Nd5! White ignores material completely: every piece now aims at the black king.",
              35: "18.Bd6!! White gives up **both rooks**. The bishop takes f8 from the black king.",
              42: "21.Nxg7+ Kd8. The black king is completely surrounded.",
              43: "22.Qf6+!! The final sacrifice deflects the g8-knight…",
              45: "23.Be7#. White mates with only three minor pieces left: bishop and two knights against a whole army. **Activity beats material.**",
            },
          },
        ],
      },
      {
        id: "studies",
        title: "Endgame studies",
        summary: "Saavedra: the most famous study ever",
        steps: [
          {
            type: "text",
            text: "Endgame **studies** are composed positions with one hidden, beautiful solution. Solving them trains exactly what masters need: seeing **resources** (stalemate tricks, underpromotion, quiet moves) that normal thinking misses.",
          },
          {
            type: "move",
            fen: "8/8/1KP5/3r4/8/8/8/k7 w - - 0 1",
            solution: [
              "c7",
              "Rd6+",
              "Kb5",
              "Rd5+",
              "Kb4",
              "Rd4+",
              "Kb3",
              "Rd3+",
              "Kc2",
              "Rd4",
              "c8=R",
              "Ra4",
              "Kb3",
            ],
            text: "**Saavedra (1895).** White to move and win. The pawn runs, the rook checks, and then Black springs a stalemate trap. You must see past it.",
            hint: "After …Rd4, queening allows …Rc4+! and Qxc4 is stalemate. What else could the pawn become?",
            success:
              "**8.c8=R!!** Underpromotion avoids the stalemate and threatens Ra8#. After …Ra4, Kb3 attacks the rook and threatens Rc1#: White wins.",
          },
        ],
      },
      {
        id: "bn-mate",
        title: "Bishop and knight mate",
        summary: "The hardest basic mate",
        steps: [
          {
            type: "text",
            fen: "8/8/8/4k3/8/8/8/2B1KN2 w - - 0 1",
            text: "King, bishop and knight against king is a forced mate, but only in a **corner the bishop’s colour**, and only within the 50-move limit if you know the method.\n\n1. Drive the king to the edge using all three pieces together.\n2. If it runs to the **wrong** corner, push it along the edge towards the right corner with the **W-manoeuvre**: the knight hops along a W-shaped route, covering the escape squares of the colour the bishop cannot reach, while bishop and king keep the box closed.\n3. In the right corner: bishop and knight take the squares, the king supports, mate.\n\nIt can take 30+ moves. Practise until you can do it from any position.",
          },
          {
            type: "play",
            fen: "8/8/8/4k3/8/8/8/2B1KN2 w - - 0 1",
            goal: "mate",
            level: 7,
            text: "Mate the computer with bishop and knight. Your bishop is dark-squared, so aim for **a1 or h8**.",
          },
        ],
      },
    ],
  },

  {
    id: "gm",
    title: "The Grandmaster Path",
    level: "2300 and beyond",
    blurb:
      "What separates masters from grandmasters, and how to train for it. This stage is a map and a training plan; the work is yours.",
    lessons: [
      {
        id: "gm-reality",
        title: "What it really takes",
        summary: "An honest roadmap",
        steps: [
          {
            type: "text",
            text: "No app makes anyone a grandmaster. The title takes **norms in strong over-the-board tournaments** and a FIDE rating of 2500. For most people who reach it, that means **10+ years** of serious work, hundreds of classical games, and coaching.\n\nWhat *is* in your control is training the right things, consistently. The players who improve fastest share these habits:\n\n- They play **long time-control games** against stronger opponents, often.\n- They **analyse every game themselves first**, before the engine.\n- They solve **hard** exercises, not easy ones, and calculate without moving pieces.\n- They study **classic games** and endgame theory deeply, not just openings.\n- They keep a **training diary** of their mistakes and fix the patterns.",
          },
          {
            type: "text",
            text: "**A weekly plan for a serious adult improver (10–15 hours):**\n\n- **3 h: calculation.** Hard puzzles (rated 300+ above you), set up and solved without moving pieces, line written down.\n- **2 h: endgames.** Theory (the canon in the next lesson) and playing out positions against the engine.\n- **2 h: classic games.** Play through annotated games; guess each move before revealing it.\n- **1–2 h: openings.** Repair lines from your own games; study typical middlegame plans.\n- **3–5 h: play and analyse.** At least one long game (60+ min each), analysed thoroughly.\n\nQuality beats quantity. Ten hard puzzles solved fully beat a hundred played on intuition.",
          },
        ],
      },
      {
        id: "gm-endgame-canon",
        title: "The endgame canon",
        summary: "Theory every grandmaster knows",
        steps: [
          {
            type: "text",
            text: "Grandmasters know a body of exact endgame theory cold. Work through it with a dedicated book (Dvoretsky’s *Endgame Manual* is the standard) and check each item off:\n\n- **Pawn endings**: key squares, opposition, triangulation, corresponding squares, outside and protected passed pawns, breakthroughs.\n- **Rook endings**: Lucena, Philidor, Vancura, the short-side defence, rook + 2 vs rook + 1 on one wing, rook vs pawns, rook + bishop vs rook (Philidor / Cochrane defence).\n- **Minor pieces**: bishop vs knight, same and opposite-coloured bishops (blockades, the “two diagonals” rule), wrong-coloured bishop and rook pawn.\n- **Queen endings**: queen vs pawn on the 7th (when the rook- and bishop-pawn draw), queen vs rook, queen + pawn vs queen.\n- **Basic mates**: two bishops, bishop + knight.",
          },
          {
            type: "text",
            text: "Beyond theory lies **endgame strategy**: king activity, the principle of two weaknesses, “do not hurry”, when to trade into a pawn ending. Shereshevsky’s *Endgame Strategy* covers this.\n\nUse the **Analyse** tab here to set up any theoretical position (paste a FEN) and play it out against the engine from both sides.",
          },
        ],
      },
      {
        id: "gm-calc",
        title: "Deep calculation",
        summary: "Model game: the Game of the Century",
        steps: [
          {
            type: "text",
            text: "At grandmaster level, calculation means seeing **quiet moves** in long lines, keeping several branches in your head, and judging the final position accurately.\n\nTraining methods used by top coaches:\n- **Dvoretsky-style exercises**: complex positions with many branches, solved in full, written down, then compared with the solution.\n- **Solve studies** (the endgame composition kind): they train imagination and precision together.\n- **Blindfold visualisation**: follow games from notation alone, then try to name the position.",
          },
          {
            type: "game",
            orientation: "b",
            pgn: '[White "Donald Byrne"]\n[Black "Robert James Fischer"]\n1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5 6. Qb3 dxc4 7. Qxc4 c6 8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4 11. Bg5 Na4 12. Qa3 Nxc3 13. bxc3 Nxe4 14. Bxe7 Qb6 15. Bc4 Nxc3 16. Bc5 Rfe8+ 17. Kf1 Be6 18. Bxb6 Bxc4+ 19. Kg1 Ne2+ 20. Kf1 Nxd4+ 21. Kg1 Ne2+ 22. Kf1 Nc3+ 23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1 26. h3 Rxa2 27. Kh2 Nxf2 28. Re1 Rxe1 29. Qd8+ Bf8 30. Nxe1 Bd5 31. Nf3 Ne4 32. Qb8 b5 33. h4 h5 34. Ne5 Kg7 35. Kg1 Bc5+ 36. Kf1 Ng3+ 37. Ke1 Bb4+ 38. Kd1 Bb3+ 39. Kc1 Ne2+ 40. Kb1 Nc3+ 41. Kc1 Rc2# 0-1',
            text: "**The Game of the Century**, New York 1956. Thirteen-year-old Bobby Fischer, playing Black, finds two stunning ideas. Before each annotated move, stop and try to find it yourself.",
            notes: {
              22: "11…Na4!! A knight offer that exploits White’s uncastled king. If 12.Nxa4 Nxe4 and the e-file and long diagonal open.",
              28: "Black has given up material; the white king is still stuck in the centre.",
              34: "17…Be6!!: Fischer **gives up his queen**. Calculated many moves deep: the bishops and knight will win far more.",
              35: "18.Bxb6 Bxc4+ and now a **windmill** of discovered checks follows.",
              40: "20…Nxd4+: each discovered check lets the knight collect material. Next it returns to e2 and then c3, eyeing the rook on d1.",
              50: "For the queen, Black has rook, two bishops, knight and pawns. That is far too much. The rest is technique.",
              82: "41…Rc2#. Precise to the end: minor pieces and rook coordinate into a mating net.",
            },
          },
        ],
      },
      {
        id: "gm-openings",
        title: "A professional repertoire",
        summary: "Preparation like a grandmaster",
        steps: [
          {
            type: "text",
            text: "Grandmaster openings are not memorised lists; they are files of **understood** positions.\n\n- Keep your repertoire in a **database** (PGN files work). Every line has a short note on the plan and the typical structure.\n- Prepare **against specific opponents** before tournament games: what do they play, where do they go wrong, which structures do they dislike?\n- Use engines to **check** your ideas, not to supply them. Ask *why* an engine move works until you could explain it to a student.\n- Have **one sharp and one solid** option against main lines, so you can choose based on the tournament situation.",
          },
        ],
      },
      {
        id: "gm-practice",
        title: "Tournament practice",
        summary: "Time, nerves and practical decisions",
        steps: [
          {
            type: "text",
            text: "Many grandmaster games are decided by practical factors, not pure chess:\n\n- **Time**: budget your clock. A typical pattern is ~15 minutes on the opening, most of your time on the critical middlegame moments, and a reserve for the ending.\n- **Practical choices**: in a bad position, choose the line that sets the most problems, not the one an engine prefers by 0.1.\n- **Emotions**: after a blunder, sit on your hands, reset, and re-evaluate the position as if you had just arrived.\n- **Health**: sleep, exercise and food matter in 5-hour games over 9 rounds.\n- **Coaching**: almost everyone who reaches GM had strong coaches. Find one when you plateau.",
          },
          {
            type: "text",
            text: "**Recommended reading for the road ahead** (look for them at your library or bookshop):\n\n- Artur Yusupov: the *Build Up Your Chess* / *Boost Your Chess* / *Chess Evolution* series (a complete 9-book course from ~1500 to 2300+)\n- Mark Dvoretsky: *Dvoretsky’s Endgame Manual*\n- Jacob Aagaard: the *Grandmaster Preparation* series\n- Alexander Kotov: *Think Like a Grandmaster*\n- Aron Nimzowitsch: *My System*\n- Mikhail Shereshevsky: *Endgame Strategy*\n- John Watson: *Secrets of Modern Chess Strategy*\n\nThen keep coming back here: puzzles to stay sharp, the analysis board for your own games, and the lessons whenever a topic needs revisiting. Good luck on the path.",
          },
        ],
      },
    ],
  },
];
