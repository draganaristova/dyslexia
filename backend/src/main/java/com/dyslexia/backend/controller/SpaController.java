package com.dyslexia.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({
            "/",
            "/login",
            "/register",
            "/forgot-password",
            "/gameselection",
            "/progress",
            "/profile",
            "/world/{worldId}",
            "/world/{worldId}/exercise/{gamesId}/{gamesType}/{pinNumber}"
    })
    public String forwardToReact() {
        return "forward:/index.html";
    }
}