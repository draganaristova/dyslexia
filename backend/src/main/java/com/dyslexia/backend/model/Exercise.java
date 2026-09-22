package com.dyslexia.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "exercises", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"games_id", "games_type", "age_group"})
})
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "games_id", nullable = false)
    private Games games;

    @Enumerated(EnumType.STRING)
    private GamesType gamesType;

    @Enumerated(EnumType.STRING)
    private AgeGroup ageGroup;

    private Integer pinNumber;
    
    @Column(columnDefinition = "TEXT")
    private String contentJson;

    public Exercise() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Games getGames() {
        return games;
    }

    public void setGames(Games games) {
        this.games = games;
    }

    public GamesType getGamesType() {
        return gamesType;
    }

    public void setGamesType(GamesType gamesType) {
        this.gamesType = gamesType;
    }

    public AgeGroup getAgeGroup() {
        return ageGroup;
    }

    public void setAgeGroup(AgeGroup ageGroup) {
        this.ageGroup = ageGroup;
    }

    public Integer getPinNumber() {
        return pinNumber;
    }

    public void setPinNumber(Integer pinNumber) {
        this.pinNumber = pinNumber;
    }

    public String getContentJson() {
        return contentJson;
    }

    public void setContentJson(String contentJson) {
        this.contentJson = contentJson;
    }
}