const  userRoutes ={
    GETUSER: "user/:userId?",
    POSTUSER: "user",
    PUTUSER:"user/:userId",
    DELETEUSER: "user/:userId",
    LOGINUSER:"login"

}

const figCoordRoutes ={
    GETFIGCOORD: "figCoord/:figureId?",
    POSTFIGCOORD: "figCoord/",
    UPDATEFIGCOORD: "figCoord/:figureId",
    DELETEFIGCOORD: "figCoord/:figureId"
}

const homographyRoutes ={
    GETHOMOGRAPHY:"homography/:homographyId?",
    POSTHOMOGRAPHY: "homography",
    PUTHOMOGRAPHY: "homography/:homographyId",
    DELETEHOMOGRAPHY : "homography/:homographyId"
}

const playersRoutes ={
    GETPLAYERS : "player/:playerId?",
    POSTPLAYERS : "player",
    PUTPLAYERS : "player/:playerId",
    DELETEPLAYERS : "player/:playerId"

}

const playsRoutes = {
    GETPLAYS: "plays",
    POSTPLAYS: "plays",
    PUTPLAYS: "plays/:playId",
    DELETEPLAYS: "plays/:playId",
    GETPLAYSFIGURES: "plays/:playId/figCoord",
    GETPLAYFIGCOORD: "play/figCoord",

};

const sessionMovesRoutes = {
    GETSESSIONMOVES: "sessionMoves/:sessionMoveId?",
    POSTSESSIONMOVES: "sessionMoves",
    PUTSESSIONMOVES: "sessionMoves/:sessionMoveId",
    DELETESESSIONMOVES: "sessionMoves/:sessionMoveId"
};

const sessionAnalyticsRoutes = {
    GETSESSIONANAL: "sessionAnalytics/:sessionAnalyticId??",
    POSTSESSIONANAL: "sessionAnalytics",
    PUTSESSIONANAL: "sessionAnalytics/:sessionAnalyticId",
    DELETESESSIONANAL: "sessionAnalytics/:sessionAnalyticId"
};

const sessionsRoutes = {
    GETSESSIONS: "sessions/:sessionId?",
    POSTSESSIONS: "sessions",
    PUTSESSIONS: "sessions/:sessionId",
    DELETESESSIONS: "sessions/:sessionId"
};

const Routes ={
    userRoutes,
    figCoordRoutes,
    homographyRoutes,
    playersRoutes,
    playsRoutes,
    sessionMovesRoutes,
    sessionAnalyticsRoutes,
    sessionsRoutes
}
export default Routes;