package com.ttv.facedemo

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch

private const val TAG: String = "EvaluationViewModel"

sealed class EvaluationResultState {
    data class Loading(val message: String? = null) : EvaluationResultState()
    data class Success(val data: PerformanceMetrics) : EvaluationResultState()
}

class EvaluationViewModel(private val repository: EvaluationRepository) : ViewModel() {
    private val _resultState = MutableLiveData<EvaluationResultState>(EvaluationResultState.Loading("Evaluating..."))
    val resultState: LiveData<EvaluationResultState> get() = _resultState

    private val _errorMessagesState = MutableLiveData(listOf<String>())
    val errorMessagesState: LiveData<List<String>> get() = _errorMessagesState

    fun startEvaluation() {
        viewModelScope.launch {
            val (performanceMetrics, errors) = repository.evaluatePerformance()
            _resultState.value = EvaluationResultState.Success(performanceMetrics)
            _errorMessagesState.value = errors
        }
    }
}
