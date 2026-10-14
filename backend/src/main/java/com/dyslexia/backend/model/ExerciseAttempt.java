package com.dyslexia.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "exercise_attempts")
public class ExerciseAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;


    /*
     * Реден број на обидот:
     *
     * 1
     * 2
     * 3
     * ...
     */
    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber;


    /*
     * 1 ако е точен,
     * 0 ако е погрешен.
     */
    @Column(nullable = false)
    private Integer score;


    /*
     * Дали одговорот бил точен
     */
    @Column(nullable = false)
    private Boolean correct;


    /*
     * Дали задачата е завршена
     */
    @Column(nullable = false)
    private Boolean completed;


    /*
     * Прашањето во моментот на обидот
     */
    @Column(columnDefinition = "TEXT")
    private String question;


    /*
     * Одговорот што го избрало детето
     */
    @Column(name = "selected_answer", columnDefinition = "TEXT")
    private String selectedAnswer;


    /*
     * Точниот одговор
     */
    @Column(name = "correct_answer", columnDefinition = "TEXT")
    private String correctAnswer;


    /*
     * Дали времето истекло
     */
    @Column(name = "timed_out", nullable = false)
    private Boolean timedOut;


    /*
     * Кога е направен обидот
     */
    @Column(name = "attempted_at", nullable = false)
    private LocalDateTime attemptedAt;


    public ExerciseAttempt() {
    }


    public Long getId() {
        return id;
    }


    public User getUser() {
        return user;
    }


    public void setUser(User user) {
        this.user = user;
    }


    public Exercise getExercise() {
        return exercise;
    }


    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }


    public Integer getAttemptNumber() {
        return attemptNumber;
    }


    public void setAttemptNumber(Integer attemptNumber) {
        this.attemptNumber = attemptNumber;
    }


    public Integer getScore() {
        return score;
    }


    public void setScore(Integer score) {
        this.score = score;
    }


    public Boolean getCorrect() {
        return correct;
    }


    public void setCorrect(Boolean correct) {
        this.correct = correct;
    }


    public Boolean getCompleted() {
        return completed;
    }


    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }


    public String getQuestion() {
        return question;
    }


    public void setQuestion(String question) {
        this.question = question;
    }


    public String getSelectedAnswer() {
        return selectedAnswer;
    }


    public void setSelectedAnswer(String selectedAnswer) {
        this.selectedAnswer = selectedAnswer;
    }


    public String getCorrectAnswer() {
        return correctAnswer;
    }


    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }


    public Boolean getTimedOut() {
        return timedOut;
    }


    public void setTimedOut(Boolean timedOut) {
        this.timedOut = timedOut;
    }


    public LocalDateTime getAttemptedAt() {
        return attemptedAt;
    }


    public void setAttemptedAt(LocalDateTime attemptedAt) {
        this.attemptedAt = attemptedAt;
    }
}