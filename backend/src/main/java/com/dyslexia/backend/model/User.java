package com.dyslexia.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="users")

public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String surname;

    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false)
    private String gender;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String avatarEmoji = "🦊";
    private Boolean dyslexiaFont = false;
    private Integer fontSize = 16;
    private Integer letterSpacing = 0;
    private Boolean readAloud = false;
    private String theme = "cream";

    private Boolean hasTakenDyslexiaTest = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    private User(){

    }

    public Long getId(){
        return id;
    }

    public void setId(Long id){
        this.id = id;
    }

    public String getName(){
        return name;
    }

    public void setName(String name){
        this.name = name;
    }

     public String getSurname(){
        return surname;
    }

    public void setSurname(String surname){
        this.surname = surname;
    }

    public Integer getAge(){
        return age;
    }

    public void setAge(Integer age){
        this.age = age;
    }

    public String getGender(){
        return gender;
    }

    public void setGender(String gender){
        this.gender = gender;
    }
    
    public String getEmail() {
        return email;
    }
 
    public void setEmail(String email) {
        this.email = email;
    }
 
    public String getPassword() {
        return password;
    }
 
    public void setPassword(String password) {
        this.password = password;
    }

     public String getAvatarEmoji() {
        return avatarEmoji;
    }
 
    public void setAvatarEmoji(String avatarEmoji) {
        this.avatarEmoji = avatarEmoji;
    }
 
    public Boolean getDyslexiaFont() {
        return dyslexiaFont;
    }
 
    public void setDyslexiaFont(Boolean dyslexiaFont) {
        this.dyslexiaFont = dyslexiaFont;
    }
 
    public Integer getFontSize() {
        return fontSize;
    }
 
    public void setFontSize(Integer fontSize) {
        this.fontSize = fontSize;
    }
 
    public Integer getLetterSpacing() {
        return letterSpacing;
    }
 
    public void setLetterSpacing(Integer letterSpacing) {
        this.letterSpacing = letterSpacing;
    }
 
    public Boolean getReadAloud() {
        return readAloud;
    }
 
    public void setReadAloud(Boolean readAloud) {
        this.readAloud = readAloud;
    }
 
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
 
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

       public String getTheme() {
        return theme;
    }
 
    public void setTheme(String theme) {
        this.theme = theme;
    }
 
    public Boolean getHasTakenDyslexiaTest() {
        return hasTakenDyslexiaTest;
    }
 
    public void setHasTakenDyslexiaTest(Boolean hasTakenDyslexiaTest) {
        this.hasTakenDyslexiaTest = hasTakenDyslexiaTest;
    }


}
