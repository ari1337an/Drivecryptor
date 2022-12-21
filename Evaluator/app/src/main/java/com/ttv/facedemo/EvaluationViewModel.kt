package com.ttv.facedemo

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch

private const val TAG: String = "EvaluationViewModel"

sealed class EvaluationResultsState {
    data class Loading(val message: String? = null) : EvaluationResultsState()
    data class Success(val data: PerformanceMetrics) : EvaluationResultsState()
}

class EvaluationViewModel(private val repository: EvaluationRepository) : ViewModel() {
    private val _resultsState = MutableLiveData<EvaluationResultsState>(null)
    val resultsState: LiveData<EvaluationResultsState> get() = _resultsState

    private val _errorMessagesState = MutableLiveData<List<String>>(null)
    val errorMessagesState: LiveData<List<String>> get() = _errorMessagesState

    fun startEvaluation() {
        _resultsState.value = EvaluationResultsState.Loading("Evaluating...")

        viewModelScope.launch {
            val (performanceMetrics, errorMessages) = repository.evaluatePerformance()
            _resultsState.value = EvaluationResultsState.Success(performanceMetrics)
            _errorMessagesState.value = errorMessages
        }
    }
}
