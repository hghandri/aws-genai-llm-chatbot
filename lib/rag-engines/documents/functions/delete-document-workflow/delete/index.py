import genai_core.types
import genai_core.documents
import genai_core.aurora.delete
import genai_core.opensearch.delete
import genai_core.kendra.delete
from aws_lambda_powertools import Logger
from aws_lambda_powertools.utilities.typing import LambdaContext

logger = Logger()


@logger.inject_lambda_context(log_event=True)
def lambda_handler(event, context: LambdaContext):
    workspace_id = event["workspace_id"]
    document_id = event["document_id"]
    document = genai_core.documents.get_document(workspace_id, document_id)
    workspace = genai_core.workspaces.get_workspace(workspace_id)

    if document is None:
        raise genai_core.types.CommonError("Document not found")

    if workspace["engine"] == "aurora":
        genai_core.aurora.delete.delete_aurora_document(document)
    elif workspace["engine"] == "opensearch":
        raise genai_core.types.CommonError("Workspace engine not supported")
    elif workspace["engine"] == "kendra":
        raise genai_core.types.CommonError("Workspace engine not supported")
    else:
        raise genai_core.types.CommonError("Workspace engine not supported")
