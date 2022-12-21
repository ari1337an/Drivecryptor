package com.ttv.facedemo

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.databinding.DataBindingUtil
import com.ttv.facedemo.databinding.ActivityMainBinding
import java.io.File

const val REFERENCE_PREFIX: String = "ref"
const val PHOTOS_DIR_NAME: String = "photos"

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

            viewModel.resultsState.observe(this) {
                binding.results.text = getString(R.string.results_template,
                    when (it) {
                        null -> "Results will be shown here"
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
            }

            viewModel.errorMessagesState.observe(this) { messages ->
                binding.errors.text = getString(R.string.errors_template,
                    when (messages) {
                        null -> "None so far..."
                        emptyList<String>() -> "None :)"
                        else -> messages.joinToString(separator = "\n") { "• $it" }
                    }
                )
            }
        }
    }
}
