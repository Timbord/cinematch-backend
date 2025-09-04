# CineMatch 🎬 - Backend

**Dieses Repository enthält den Backend-Server für die CineMatch-App, der als Middleware zwischen dem Frontend und externen APIs (TMDB, ChatGPT) fungiert. Das Projekt wurde im Rahmen meiner Bachelorarbeit an der Technischen Hochschule Brandenburg entwickelt.**

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

---

### Inhaltsverzeichnis

- [Über das Projekt](#über-das-projekt)
- [Status des Projekts](#status-des-projekts)
- [API-Endpunkte](#api-endpunkte)
- [Erste Schritte](#erste-schritte)
- [Technologien](#technologien)
- [Kontakt](#kontakt)

---

### Über das Projekt

Der Express.js-Server übernimmt zwei Hauptaufgaben:

1.  **Verwaltung des TMDB API-Schlüssels:** Er agiert als Proxy, um den privaten API-Schlüssel nicht im Frontend preisgeben zu müssen.
2.  **Intelligente Chatbot-Logik:** Er verarbeitet Anfragen vom Frontend, reichert diese mit spezifischen Filmdaten von der TMDB-API an und kommuniziert mit der ChatGPT-API, um eine konversationsbasierte Filmsuche zu ermöglichen.

---

### Status des Projekts

Dieses Backend wurde für die Bachelorarbeit "CineMatch" entwickelt und ist konzeptionell vollständig. **Wichtiger Hinweis:** Der Server ist funktionsfähig, jedoch wird für die Anbindung an die ChatGPT-API ein gültiger, privater API-Schlüssel benötigt. Der in der Bachelorarbeit verwendete Schlüssel ist **nicht** in diesem Repository enthalten und nicht mehr aktiv.

---

### API-Endpunkte

Die wichtigsten Endpunkte sind:

- `GET /api/movies/popular`: Ruft beliebte Filme von der TMDB ab.
- `GET /api/movies/search?q={query}`: Sucht nach Filmen.
- `POST /api/chat`: Verarbeitet die Chat-Nachrichten für den Chatbot "Matchy" (benötigt gültigen ChatGPT API-Schlüssel).

---

### Erste Schritte

Um den Server lokal auszuführen, folgen Sie diesen Schritten:

1.  **Repository klonen**
    ```sh
    git clone [https://github.com/dein-username/cinematch-backend.git](https://github.com/dein-username/cinematch-backend.git)
    ```
2.  **Abhängigkeiten installieren**
    ```sh
    npm install
    ```
3.  **Umgebungsvariablen einrichten**
    Erstellen Sie eine `.env`-Datei im Hauptverzeichnis und fügen Sie Ihre API-Schlüssel hinzu:
    ```
    TMDB_API_KEY=dein_tmdb_api_schlüssel
    OPENAI_API_KEY=dein_openai_api_schlüssel
    ```
4.  **Server starten**
    ```sh
    npm start
    ```
    Der Server läuft dann standardmäßig auf `http://localhost:8000`.

---

### Technologien

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Axios](https://axios-http.com/)
- [dotenv](https://www.npmjs.com/package/dotenv)

---

### Kontakt

Lorenz Karow - [deine-email@gmail.com](mailto:deine-email@gmail.com)

Projekt-Link: [https://github.com/dein-username/cinematch-backend](https://github.com/dein-username/cinematch-backend)
