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

        binding.instructions.text = """
            INSTRUCTIONS:
            Each of the 20 directories must have a single photo file whose name starts with `$REFERENCE_PREFIX`.
            The directories should go here: `${File(getExternalFilesDir(null), PHOTOS_DIR_NAME).path}`
        """.trimIndent()

        binding.startButton.setOnClickListener {
            viewModel.startEvaluation()

            viewModel.resultState.observe(this) { resultState ->
                when (resultState) {
                    is EvaluationResultState.Success -> {
                        resultState.data.run {
                            binding.textView.text = """
                                RESULTS:
                                Confusion matrix: $confusionMatrix
                                Precisions: $precisions
                                Recalls: $recalls
                                Micro F1: $microF1
                                Macro F1: $macroF1
                                Accuracy: $accuracy
                            """.trimIndent()
                        }
                        binding.startButton.isEnabled = false
                    }
                    is EvaluationResultState.Loading -> binding.textView.text = "${resultState.message ?: "Loading..."}"
                }
            }

            viewModel.errorMessagesState.observe(this) { errorMessages ->
                binding.errors.text = "ERRORS:\n${errorMessages.map { "* $it\n" }}"
            }
        }
    }
}
