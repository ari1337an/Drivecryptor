package com.ttv.facedemo

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.databinding.DataBindingUtil
import com.ttv.facedemo.databinding.ActivityMainBinding
import java.io.File

const val REFERENCE_PREFIX: String = "ref"
const val PHOTOS_DIR_NAME: String = "photos"
const val CONFUSION_MATRIX_OUT_FILENAME: String = "confmat.txt"
const val METRICS_OUT_FILENAME: String = "metrics.txt"

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var viewModel: EvaluationViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = DataBindingUtil.setContentView(this, R.layout.activity_main)
        viewModel = EvaluationViewModel(EvaluationRepository(this))

        binding.instructions.text = getString(R.string.instructions_template, File(getExternalFilesDir(null), PHOTOS_DIR_NAME).path, REFERENCE_PREFIX)

        binding.startButton.setOnClickListener {
            viewModel.startEvaluation()
            binding.startButton.isEnabled = false
        }
        binding.saveButton.setOnClickListener {
            viewModel.saveData()
            binding.saveButton.isEnabled = false
        }

        viewModel.resultsState.observe(this) {
            binding.results.text = getString(R.string.results_template,
                when (it) {
                    null -> "Results will be shown here."
                    is EvaluationResultsState.Loading -> it.message ?: "Starting…"
                    is EvaluationResultsState.Success -> it.data.run {
                        getString(R.string.results_payload_template,
                            confusionMatrix.joinToString(separator = "\n"),
                            precisions,
                            recalls,
                            microF1,
                            macroF1,
                            accuracy
                        )
                    }
                }
            )
            if (it is EvaluationResultsState.Success) {
                binding.saveButton.isEnabled = true
            }
        }
        viewModel.errorMessagesState.observe(this) { messages ->
            binding.errors.text = getString(R.string.errors_template,
                when (messages) {
                    null -> "Errors will be shown here."
                    emptyList<String>() -> "None :)"
                    else -> messages.joinToString(separator = "\n") { "• $it" }
                }
            )
        }
        viewModel.dataSavedState.observe(this) {
            if (it == true)
                Toast.makeText(
                    this,
                    "Successfully saved data to files $CONFUSION_MATRIX_OUT_FILENAME and $METRICS_OUT_FILENAME",
                    Toast.LENGTH_SHORT
                ).show()
        }
    }
}
